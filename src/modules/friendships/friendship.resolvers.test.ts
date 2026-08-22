import { beforeEach, describe, expect, it, vi } from "vitest";
import { friendshipResolvers } from "./friendship.resolvers.js";
import { friendshipService } from "./FriendshipService.js";

vi.mock("./FriendshipService.js", () => ({
  friendshipService: {
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    cancelFriendRequest: vi.fn(),
    getFriendshipStatus: vi.fn(),
  },
}));

const mockedService = vi.mocked(friendshipService, true);

describe("friendship.resolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query: getFriendshipStatus", () => {
    it("debería lanzar un error si no está autenticado", async () => {
      const context = { user: null };

      await expect(
        friendshipResolvers.Query.getFriendshipStatus(
          {},
          { friendId: "2" },
          context,
        ),
      ).rejects.toThrow("No estás autenticado");

      expect(mockedService.getFriendshipStatus).not.toHaveBeenCalled();
    });

    it("debería lanzar un error si user.id es undefined", async () => {
      const context = { user: {} };

      await expect(
        friendshipResolvers.Query.getFriendshipStatus(
          {},
          { friendId: "2" },
          context,
        ),
      ).rejects.toThrow("No estás autenticado");

      expect(mockedService.getFriendshipStatus).not.toHaveBeenCalled();
    });

    it("debería lanzar un error si friendId no es un número válido", async () => {
      const context = { user: { id: 1 } };

      await expect(
        friendshipResolvers.Query.getFriendshipStatus(
          {},
          { friendId: "abc" },
          context,
        ),
      ).rejects.toThrow("ID de usuario inválido");

      expect(mockedService.getFriendshipStatus).not.toHaveBeenCalled();
    });

    it("debería retornar el estado de amistad cuando es exitoso", async () => {
      const context = { user: { id: 1 } };
      mockedService.getFriendshipStatus.mockResolvedValueOnce("confirmed");

      const result = await friendshipResolvers.Query.getFriendshipStatus(
        {},
        { friendId: "2" },
        context,
      );

      expect(mockedService.getFriendshipStatus).toHaveBeenCalledWith(1, 2);
      expect(result).toBe("confirmed");
    });
  });

  describe("Mutation: sendFriendRequest", () => {
    it("debería lanzar un error si no está autenticado", async () => {
      const context = { user: null };

      await expect(
        friendshipResolvers.Mutation.sendFriendRequest(
          {},
          { friendId: "2" },
          context,
        ),
      ).rejects.toThrow("No estás autenticado");

      expect(mockedService.sendFriendRequest).not.toHaveBeenCalled();
    });

    it("debería lanzar un error si friendId no es un número válido", async () => {
      const context = { user: { id: 1 } };

      await expect(
        friendshipResolvers.Mutation.sendFriendRequest(
          {},
          { friendId: "xyz" },
          context,
        ),
      ).rejects.toThrow("ID de usuario inválido");

      expect(mockedService.sendFriendRequest).not.toHaveBeenCalled();
    });

    it("debería retornar éxito cuando la solicitud se envía correctamente", async () => {
      const context = { user: { id: 1 } };
      mockedService.sendFriendRequest.mockResolvedValueOnce(true);

      const result = await friendshipResolvers.Mutation.sendFriendRequest(
        {},
        { friendId: "2" },
        context,
      );

      expect(mockedService.sendFriendRequest).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({
        success: true,
        message: "Solicitud de amistad enviada correctamente",
      });
    });
  });

  describe("Mutation: acceptFriendRequest", () => {
    it("debería lanzar un error si no está autenticado", async () => {
      const context = { user: null };

      await expect(
        friendshipResolvers.Mutation.acceptFriendRequest(
          {},
          { requestId: "10" },
          context,
        ),
      ).rejects.toThrow("No estás autenticado");

      expect(mockedService.acceptFriendRequest).not.toHaveBeenCalled();
    });

    it("debería lanzar un error si requestId no es un número válido", async () => {
      const context = { user: { id: 1 } };

      await expect(
        friendshipResolvers.Mutation.acceptFriendRequest(
          {},
          { requestId: "abc" },
          context,
        ),
      ).rejects.toThrow("ID de usuario/solicitud inválido");

      expect(mockedService.acceptFriendRequest).not.toHaveBeenCalled();
    });

    it("debería retornar éxito cuando la solicitud se acepta correctamente", async () => {
      const context = { user: { id: 1 } };
      mockedService.acceptFriendRequest.mockResolvedValueOnce(true);

      const result = await friendshipResolvers.Mutation.acceptFriendRequest(
        {},
        { requestId: "10" },
        context,
      );

      expect(mockedService.acceptFriendRequest).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        success: true,
        message: "Solicitud de amistad aceptada correctamente",
      });
    });
  });

  describe("Mutation: cancelFriendRequest", () => {
    it("debería lanzar un error si no está autenticado", async () => {
      const context = { user: null };

      await expect(
        friendshipResolvers.Mutation.cancelFriendRequest(
          {},
          { friendId: "2" },
          context,
        ),
      ).rejects.toThrow("No estás autenticado");

      expect(mockedService.cancelFriendRequest).not.toHaveBeenCalled();
    });

    it("debería lanzar un error si friendId no es un número válido", async () => {
      const context = { user: { id: 1 } };

      await expect(
        friendshipResolvers.Mutation.cancelFriendRequest(
          {},
          { friendId: "xyz" },
          context,
        ),
      ).rejects.toThrow("ID de usuario inválido");

      expect(mockedService.cancelFriendRequest).not.toHaveBeenCalled();
    });

    it("debería retornar éxito cuando la solicitud se cancela correctamente", async () => {
      const context = { user: { id: 1 } };
      mockedService.cancelFriendRequest.mockResolvedValueOnce(true);

      const result = await friendshipResolvers.Mutation.cancelFriendRequest(
        {},
        { friendId: "2" },
        context,
      );

      expect(mockedService.cancelFriendRequest).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({
        success: true,
        message: "Solicitud de amistad cancelada correctamente",
      });
    });
  });

  describe("friendshipResolvers - Propagación de Errores", () => {
    const context = { user: { id: 1 } };

    describe("Query.getFriendshipStatus", () => {
      it("debería propagar el error del servicio al consultar el estado de amistad", async () => {
        mockedService.getFriendshipStatus.mockRejectedValueOnce(
          new Error("Error interno del servicio de amistad"),
        );

        await expect(
          friendshipResolvers.Query.getFriendshipStatus(
            {},
            { friendId: "2" },
            context,
          ),
        ).rejects.toThrow("Error interno del servicio de amistad");
      });
    });

    describe("Mutation.sendFriendRequest", () => {
      it("debería propagar el error de dominio cuando el servicio rechaza la solicitud", async () => {
        mockedService.sendFriendRequest.mockRejectedValueOnce(
          new Error("No puedes enviarte una solicitud a ti mismo"),
        );

        await expect(
          friendshipResolvers.Mutation.sendFriendRequest(
            {},
            { friendId: "1" },
            context,
          ),
        ).rejects.toThrow("No puedes enviarte una solicitud a ti mismo");
      });
    });

    describe("Mutation.acceptFriendRequest", () => {
      it("debería propagar el error de dominio cuando no hay solicitud pendiente", async () => {
        mockedService.acceptFriendRequest.mockRejectedValueOnce(
          new Error("No hay una solicitud pendiente para aceptar"),
        );

        await expect(
          friendshipResolvers.Mutation.acceptFriendRequest(
            {},
            { requestId: "2" },
            context,
          ),
        ).rejects.toThrow("No hay una solicitud pendiente para aceptar");
      });
    });

    describe("Mutation.cancelFriendRequest", () => {
      it("debería propagar el error de dominio al cancelar una solicitud inexistente", async () => {
        mockedService.cancelFriendRequest.mockRejectedValueOnce(
          new Error("No hay una solicitud pendiente para cancelar"),
        );

        await expect(
          friendshipResolvers.Mutation.cancelFriendRequest(
            {},
            { friendId: "2" },
            context,
          ),
        ).rejects.toThrow("No hay una solicitud pendiente para cancelar");
      });
    });
  });
});
