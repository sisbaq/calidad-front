import React from "react";
import { FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from "@mui/material";
import { appColors } from "../../theme/colors";
import type { CategoryOption } from "@components/create_documents/MockDocuments";

type Props = {
  items: CategoryOption[];
  activeKey: string;
  onChange: (val: string) => void;
};

function CategoryChipsBase(props: Props): React.ReactElement {
  const { items, activeKey, onChange } = props;

  const handleChange = React.useCallback(
    (e: SelectChangeEvent<string>) => {
      onChange(String(e.target.value));
    },
    [onChange]
  );

  return React.createElement(
    FormControl,
    {
      size: "medium",
      variant: "outlined",
      sx: {
        minWidth: 240,
        "& .MuiOutlinedInput-root": {
          bgcolor: "#FFF",
          borderRadius: 2,
        },
      },
    },
    React.createElement(InputLabel, { id: "category-select-label" }, "Categoría"),
    React.createElement(
      Select<string>,
      {
        labelId: "category-select-label",
        label: "Categoría",
        value: activeKey,
        onChange: handleChange,
        inputProps: { "aria-describedby": "category-helper" },
        MenuProps: { PaperProps: { sx: { borderRadius: 2 } } },
      },
      ...items.map((opt) =>
        React.createElement(
          MenuItem,
          { key: opt.key, value: opt.key, sx: { fontWeight: 600, color: appColors.text } },
          opt.label
        )
      )
    )
  );
}

export default React.memo(CategoryChipsBase);


