import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { beforeEach, describe, expect, it, vi } from "vitest";

import pool from "../../db/database.js";
import { friendshipQueries } from "./friendshipQueries.js";
import { friendshipService } from "./FriendshipService.js";

vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
  },
}));

const mockedPool = vi.mocked(pool, true);

describe("FriendshipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("debería lanzar un error si el usuario intenta enviarse una solicitud a sí mismo", async () => {
      await expect(friendshipService.sendFriendRequest(1, 1)).rejects.toThrow(
        "No puedes enviarte una solicitud a ti mismo",
      );

      expect(mockedPool.execute).not.toHaveBeenCalled();
    });

    it("debería insertar una nueva solicitud de amistad si no existe ninguna previa", async () => {
      mockedPool.execute
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([{} as ResultSetHeader, []]);

      const result = await friendshipService.sendFriendRequest(1, 2);

      expect(mockedPool.execute).toHaveBeenNthCalledWith(
        1,
        friendshipQueries.checkExistingFriendship,
        [1, 2, 2, 1],
      );
      expect(mockedPool.execute).toHaveBeenNthCalledWith(
        2,
        friendshipQueries.insertFriendshipPending,
        [1, 2],
      );
      expect(result).toBe(true);
    });

    it("debería actualizar una solicitud existente a 'pending' si ya existe una relación", async () => {
      const existingRow = { sender_id: 2, receiver_id: 1, status: "pending" };
      mockedPool.execute
        .mockResolvedValueOnce([[existingRow as RowDataPacket], []])
        .mockResolvedValueOnce([{} as ResultSetHeader, []]);

      const result = await friendshipService.sendFriendRequest(1, 2);

      expect(mockedPool.execute).toHaveBeenNthCalledWith(
        1,
        friendshipQueries.checkExistingFriendship,
        [1, 2, 2, 1],
      );
      expect(mockedPool.execute).toHaveBeenNthCalledWith(
        2,
        friendshipQueries.updateFriendshipToPending,
        [1, 2, 2, 1],
      );
      expect(result).toBe(true);
    });

    it("debería lanzar un error si la relación existente está 'blocked'", async () => {
      const blockedRow = { sender_id: 2, receiver_id: 1, status: "blocked" };
      mockedPool.execute.mockResolvedValueOnce([
        [blockedRow as RowDataPacket],
        [],
      ]);

      await expect(friendshipService.sendFriendRequest(1, 2)).rejects.toThrow(
        "No es posible realizar esta acción",
      );
    });

    it("debería fallar y propagar el error si pool.execute rechaza por fallo de BD", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Database connection failure"),
      );

      await expect(friendshipService.sendFriendRequest(1, 2)).rejects.toThrow(
        "Database connection failure",
      );
    });
  });

  describe("acceptFriendRequest", () => {
    it("debería actualizar la solicitud a 'confirmed' y retornar true si existen filas afectadas", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as ResultSetHeader,
        [],
      ]);

      const result = await friendshipService.acceptFriendRequest(2, 1);
      expect(mockedPool.execute).toHaveBeenCalledWith(
        friendshipQueries.acceptFriendRequest,
        [1, 2],
      );
      expect(result).toBe(true);
    });

    it("debería lanzar un error si no hay filas afectadas al aceptar", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 0 } as ResultSetHeader,
        [],
      ]);

      await expect(friendshipService.acceptFriendRequest(2, 1)).rejects.toThrow(
        "No hay una solicitud pendiente para aceptar",
      );
    });

    it("debería fallar y propagar el error si pool.execute rechaza por fallo de BD", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      await expect(friendshipService.acceptFriendRequest(2, 1)).rejects.toThrow(
        "Database connection lost",
      );
    });
  });

  describe("cancelFriendRequest", () => {
    it("debería eliminar la solicitud 'pending' y retornar true si existen filas afectadas", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as ResultSetHeader,
        [],
      ]);

      const result = await friendshipService.cancelFriendRequest(1, 2);

      expect(mockedPool.execute).toHaveBeenCalledWith(
        friendshipQueries.cancelFriendRequest,
        [1, 2, 2, 1],
      );
      expect(result).toBe(true);
    });

    it("debería lanzar un error si no hay filas afectadas al cancelar", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 0 } as ResultSetHeader,
        [],
      ]);

      await expect(friendshipService.cancelFriendRequest(1, 2)).rejects.toThrow(
        "No hay una solicitud pendiente para cancelar",
      );
    });

    it("debería fallar y propagar el error si pool.execute rechaza por fallo de BD", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Query execution timeout"),
      );

      await expect(friendshipService.cancelFriendRequest(1, 2)).rejects.toThrow(
        "Query execution timeout",
      );
    });
  });

  describe("getFriendshipStatus", () => {
    it("debería retornar 'confirmed' si existe una amistad confirmada", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        [{ status: "confirmed" } as RowDataPacket],
        [],
      ]);

      const result = await friendshipService.getFriendshipStatus(1, 2);
      expect(result).toBe("confirmed");
    });

    it("debería retornar 'pending' si existe una solicitud pendiente", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        [{ status: "pending" } as RowDataPacket],
        [],
      ]);

      const result = await friendshipService.getFriendshipStatus(1, 2);
      expect(result).toBe("pending");
    });

    it("debería retornar null si no existe relación alguna", async () => {
      mockedPool.execute.mockResolvedValueOnce([[], []]);

      const result = await friendshipService.getFriendshipStatus(1, 2);
      expect(result).toBeNull();
    });

    it("debería fallar y propagar el error si pool.execute rechaza por fallo de BD", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Database connection refused"),
      );

      await expect(friendshipService.getFriendshipStatus(1, 2)).rejects.toThrow(
        "Database connection refused",
      );
    });
  });
});
