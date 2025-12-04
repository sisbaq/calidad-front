import React from "react";
import { Stack, IconButton, Tooltip, Box } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { appColors } from "../../theme/colors";

type Props = {
  onView: () => void;
  onDownload: () => void;
};

type IconWrapperProps = {
  color: string;
  children: React.ReactNode;
};

const IconWrapper = React.memo(function IconWrapper(props: IconWrapperProps): React.ReactElement {
  const { color, children } = props;
  return React.createElement(
    Box,
    {
      sx: {
        width: 36,
        height: 36,
        borderRadius: "999px",
        bgcolor: color,
        display: "grid",
        placeItems: "center",
      },
    },
    children
  );
});

function ActionCellBase(props: Props): React.ReactElement {
  const { onView, onDownload } = props;

  return React.createElement(
    Stack,
    {
      direction: "row",
      spacing: 1.5,
      justifyContent: "center",
      sx: { width: "100%" },
    },
    React.createElement(Tooltip, {
      title: "Ver",
      describeChild: true,
      children: React.createElement(
        IconButton,
        { onClick: onView, "aria-label": "Ver documento", size: "small" },
        React.createElement(IconWrapper, {
          color: appColors.blue,
          children: React.createElement(VisibilityOutlinedIcon, { sx: { color: "#FFF" }, fontSize: "small" })
        })
      )
    }),
    React.createElement(Tooltip, {
      title: "Descargar",
      describeChild: true,
      children: React.createElement(
        IconButton,
        { onClick: onDownload, "aria-label": "Descargar documento", size: "small" },
        React.createElement(IconWrapper, {
          color: appColors.green,
          children: React.createElement(DownloadOutlinedIcon, { sx: { color: "#FFF" }, fontSize: "small" })
        })
      )
    })
  );
}

export default React.memo(ActionCellBase);
