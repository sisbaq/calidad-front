import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Tooltip, type TooltipProps, type SxProps } from "@mui/material";

interface OverflowTooltipProps {
  children: ReactNode;
  placement?: TooltipProps['placement'];
  sx?: SxProps;
  tooltipProps?: Partial<Omit<TooltipProps, 'children' | 'title'>>;
}

/**
 * Muestra un tooltip SOLO si el contenido se encuentra truncado.
 * Uso:
 *  <OverflowTooltip sx={{ maxWidth: 320 }}>{valorLargo}</OverflowTooltip>
 */
export default function OverflowTooltip({
  children,
  placement = "top",
  sx = {},
  tooltipProps = {},
}: OverflowTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowed, setOverflowed] = useState(false);

  const checkOverflow = () => {
    const el = ref.current;
    if (!el) return;
    // Detecta truncamiento horizontal o vertical (por si se usa en otras vistas)
    const hasOverflow =
      el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    setOverflowed(hasOverflow);
  };

  useEffect(() => {
    checkOverflow();
  }, [children]);

  useEffect(() => {
    const handler = () => checkOverflow();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const content = (
    <Box
      ref={ref}
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...sx,
      }}
    >
      {children}
    </Box>
  );

  if (!overflowed) return content;

  return (
    <Tooltip
      title={
        // Permite multilínea dentro del tooltip
        <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {children}
        </span>
      }
      placement={placement}
      arrow
      enterDelay={400}
      {...tooltipProps}
    >
      {content}
    </Tooltip>
  );
}
