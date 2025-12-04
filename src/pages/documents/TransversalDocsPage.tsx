import React from "react";
import { Box, Container, Stack, useMediaQuery, useTheme, CircularProgress, Alert } from "@mui/material";
import type { StackProps } from "@mui/material/Stack";
import { appColors } from "../../theme/colors";
import DocumentHeader from "@components/create_documents/DocumentHeader";
import SearchBar from "@components/create_documents/SearchBar";
import CategoryChips from "@components/create_documents/CategoryChips";
import TransversalDocsTable from "@components/create_documents/TransversalsDocsTable";
import type { SigDocument, DocumentType } from "@/types/document";
import { getDocuments, getDocumentTypes } from "@/services/document.service";

function normalize(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function TransversalDocsPage(): React.ReactElement {
  const [documents, setDocuments] = React.useState<SigDocument[]>([]);
  const [documentTypes, setDocumentTypes] = React.useState<DocumentType[]>([]);
  const [query, setQuery] = React.useState<string>("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docsData, typesData] = await Promise.all([
          getDocuments(true),
          getDocumentTypes(),
        ]);
        setDocuments(docsData);
        setDocumentTypes(typesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build categories from document types
  const categories = React.useMemo(() => {
    const cats = documentTypes.map((dt) => ({
      key: dt.tipNombre,
      label: dt.tipNombre,
      count: documents.filter((d) => d.documentTypeName === dt.tipNombre).length,
    }));
    const totalCount = documents.length;
    return [
      { key: "all", label: "Todos", count: totalCount },
      ...cats,
    ];
  }, [documentTypes, documents]);

  const rows = React.useMemo<SigDocument[]>(() => {
    let data = documents;

    if (activeCategory !== "all") {
      const cat = normalize(activeCategory);
      data = data.filter((d) => normalize(d.documentTypeName) === cat);
    }

    if (query) {
      const q = normalize(query);
      data = data.filter(
        (d) =>
          normalize(d.codigo).includes(q) ||
          normalize(d.descripcion).includes(q) ||
          normalize(d.documentTypeName).includes(q) ||
          normalize(d.version).includes(q) ||
          normalize(d.processName).includes(q)
      );
    }
    return data;
  }, [documents, activeCategory, query]);

  const dir: StackProps["direction"] = isMdUp ? "row" : "column";
  const layoutProps: { direction: StackProps["direction"]; spacing: number; alignItems: "center" | "stretch" } = {
    direction: dir,
    spacing: 1.5,
    alignItems: isMdUp ? "center" : "stretch",
  };

  return (
    <Box sx={{ bgcolor: appColors.lightBg, minHeight: "100vh", py: 3 }}>
      <Container maxWidth="xl">
        <DocumentHeader />
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <Stack spacing={2}>
            <Stack {...layoutProps}>
              <CategoryChips
                items={categories}
                activeKey={activeCategory}
                onChange={setActiveCategory}
              />
              <SearchBar
                value={query}
                onChange={setQuery}
                fullWidth={true}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TransversalDocsTable rows={rows} />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
