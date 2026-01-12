import type {
  ContextMatrix,
  CreateContextMatrixPayload,
  ContextType,
} from "@/types/organization-context";
import {
  mapApiContextMatrixToFrontEnd,
  mapFrontEndCreatePayloadToApi,
  mapApiContextTypeToFrontEnd,
} from "@mappers/organization-context.mapper";
import { axiosInstance } from "@/api/axiosInstance";
import { AxiosError } from "axios";

/**
 * Fetches all available context types from the database
 * @returns Array of ContextType objects
 */
export const getContextTypes = async (): Promise<ContextType[]> => {
  try {
    const { data } = await axiosInstance.get("/get/tiposContexto");
    return data.map(mapApiContextTypeToFrontEnd);
  } catch (error) {
    console.debug("Error fetching context types:", error);
    throw new Error(
      "No se pudo obtener los tipos de contexto. Intenta más tarde",
    );
  }
};

/**
 * Fetches the current active context matrices
 * @returns ContextMatrix object
 */
export const getCurrentContextMatrix = async (): Promise<ContextMatrix> => {
  try {
    const { data } = await axiosInstance.get(
      "/get/contextoOrganizacionesVigente",
    );
    return mapApiContextMatrixToFrontEnd(data);
  } catch (error) {
    console.debug("Error fetching organization context:", error);
    throw new Error(
      "No se pudo obtener el contexto de organización vigente. Intenta más tarde",
    );
  }
};

/**
 * Fetches context matrices with optional filtering by type
 * @param tipo - Optional context type ID to filter by
 * @returns Array of ContextMatrix objects
 */
export const getContextMatrixes = async (
  tipo?: number,
): Promise<ContextMatrix[]> => {
  try {
    const params = tipo ? { tipo } : {};
    const { data } = await axiosInstance.get("/get/contextoOrganizaciones", {
      params,
    });
    return data.map(mapApiContextMatrixToFrontEnd);
  } catch (error) {
    console.debug("Error fetching organization context:", error);
    throw new Error(
      "No se pudo obtener las matrices de contexto. Intenta más tarde",
    );
  }
};

/**
 * Creates a new context matrix and uploads the associated file
 * @param contextMatrix - The context matrix payload including description, type, and file
 * @returns The created ContextMatrix object
 */
export const createContextMatrix = async (
  contextMatrix: CreateContextMatrixPayload,
): Promise<ContextMatrix | null> => {
  try {
    const { data } = await axiosInstance.post(
      "/crear/contextoOrganizaciones",
      mapFrontEndCreatePayloadToApi(contextMatrix),
    );

    const ctxId = data.ctxId;
    console.debug("ctxId:", ctxId);
    const docUrl = await uploadFile(ctxId, contextMatrix.document);
    data.linkDocumento = docUrl;

    return mapApiContextMatrixToFrontEnd(data);
  } catch (error) {
    console.debug("Error creating organization context:", error);
    
    if (error instanceof AxiosError && error.status === 400) {
      const errorMessage = error.response ? error.response.data.message : 'Ocurrió un error, intente más tarde' ;
      
      throw new Error(errorMessage);
    }
    
    throw new Error(
      "No se pudo crear el contexto de organización. Intenta más tarde",
    );
  }
};

/**
 * Updates a context matrix description and optionally replaces the file
 * @param id - The ID of the context matrix to update
 * @param description - The new description
 * @param newFile - Optional new file to replace the existing one
 * @returns The updated ContextMatrix object
 */
export const updateContextMatrix = async (
  id: number,
  description: string,
  newFile?: File | null,
): Promise<ContextMatrix> => {
  try {
    const { data } = await axiosInstance.put(
      `/editar/contextoOrganizaciones/${id}`,
      { ctxDescripcion: description },
    );

    if (newFile) {
      const docUrl = await uploadFile(id, newFile);
      data.linkDocumento = docUrl;
    }

    return mapApiContextMatrixToFrontEnd(data);
  } catch (error) {
    console.debug("Error updating context matrix:", error);

    if (error instanceof AxiosError && error.status === 400) {
      const errorMessage = error.response?.data?.message || "Ocurrió un error";
      throw new Error(errorMessage);
    }

    throw new Error("No se pudo actualizar la matriz. Intenta más tarde");
  }
};

/**
 * Deletes a context matrix by setting its status to false
 * @param id - The ID of the context matrix to delete
 */
export const deleteContextMatrix = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/contextoOrganizaciones/${id}`);
  } catch (error) {
    console.debug("Error deleting context matrix:", error);
    throw new Error(
      "No se pudo eliminar la matriz de contexto. Intenta más tarde",
    );
  }
};

/**
 * Uploads a file for a specific context matrix
 * @param ctxId - The context matrix ID
 * @param file - The file to upload
 * @returns The URL of the uploaded file
 */
const uploadFile = async (
  ctxId: number,
  file: File,
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("archivo", file);
    const { data } = await axiosInstance.post(
      `/crear/archivo/contextoOrganizaciones/${ctxId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.url;
  } catch (error) {
    console.debug("Error uploading file:", error);
    throw new Error("No se pudo subir el archivo. Intenta más tarde");
  }
};
