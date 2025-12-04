import { useMemo, useState, useEffect } from "react";
import type { SigDocument } from "@/types/document";
import { getDocuments } from "@/services/document.service";

export interface Filters {
    type: string;
    year: string | number | "";
    process: string;
}

export function useDocuments() {
    const [documents, setDocuments] = useState<SigDocument[]>([]);
    const [filters, setFilters] = useState<Filters>({ type: "", year: "", process: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const docs = await getDocuments(true); // Fetch transversal documents
            setDocuments(docs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar documentos');
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const addDocument = (doc: SigDocument): void => {
        setDocuments((prev) => [doc, ...prev]);
    };

    const filteredDocuments = useMemo(() => {
        return documents.filter((d) => {
            const matchesType = !filters.type || d.documentTypeName === filters.type;
            const docYear = new Date(d.createdAt).getFullYear();
            const matchesYear = !filters.year || docYear === Number(filters.year);
            const matchesProcess = !filters.process || d.processName === filters.process;
            return matchesType && matchesYear && matchesProcess;
        });
    }, [documents, filters]);

    return {
        documents,
        filteredDocuments,
        addDocument,
        filters,
        setFilters,
        loading,
        error,
        refetch: fetchDocuments,
    };
}
