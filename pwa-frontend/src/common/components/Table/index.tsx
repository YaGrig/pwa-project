import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { ChangeEvent, useMemo, useState } from "react";
import style from "./index.module.scss";

type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, sortBy: keyof T): number {
  const valA = a[sortBy];
  const valB = b[sortBy];

  const numA = parseFloat(valA as string);
  const numB = parseFloat(valB as string);

  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA > numB) return -1;
    if (numA < numB) return 1;
    return 0;
  }

  const strA = String(valA);
  const strB = String(valB);

  if (strA > strB) return -1;
  if (strA < strB) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  sortBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, sortBy)
    : (a, b) => -descendingComparator(a, b, sortBy);
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  sortBy: string;
  rowCount: number;
  cells: string[];
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    sortBy,
    numSelected,
    rowCount,
    cells,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {cells.map((headCell) => (
          <TableCell
            key={headCell}
            align={"right"}
            sortDirection={sortBy === headCell ? order : false}
          >
            <TableSortLabel
              active={sortBy === headCell}
              direction={sortBy === headCell ? order : "asc"}
              onClick={createSortHandler(headCell)}
            >
              {headCell}
              {sortBy === headCell ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number;
  header: string;
  onAdd: (value: any) => void;
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onAdd } = props;
  return (
    <Toolbar
      className={style.header}
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}
    >
      <Tooltip title="Add">
        <IconButton onClick={onAdd}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="h6"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          id="tableTitle"
          variant="h6"
          component="div"
        >
          {props.header.toUpperCase()}
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

interface TableProps<T extends Record<string, any>, S extends string> {
  rows: T[];
  header: string;
  page: number;
  limit: number;
  count: number;
  sortBy: S;
  onAdd: (value: any) => void;
  onLimitChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onSortByChange: (value: S) => void;
}

export default function EnhancedTable<
  Q extends Record<string, any>,
  S extends string
>(props: TableProps<Q, S>) {
  const {
    onLimitChange,
    onPageChange,
    onSortByChange,
    count = 10,
    limit,
    sortBy,
    page,
    onAdd,
  } = props;
  const RowKeys = useMemo(() => Object.keys(props.rows[0] || []), [props.rows]);

  const [order, setOrder] = useState<Order>("asc");
  const [selected, setSelected] = useState<readonly number[]>([]);

  const rows: Q[] = useMemo(() => {
    console.log("???", props.rows);
    return props.rows || [];
  }, [props]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const sortOption = property as S;
    const isAsc = sortBy === sortOption && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    onSortByChange(sortOption);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => +n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    onLimitChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * limit - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      [...rows].sort((a: Q, b: Q) => {
        return getComparator(order, sortBy)(a, b);
      }),
    [order, sortBy, page, rows, limit]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          header={props.header}
          onAdd={onAdd}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              sortBy={sortBy as string}
              cells={RowKeys}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(+row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                const cells = Object.values(row);

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, +row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    {cells.map((item) => (
                      <TableCell key={item.id} align="right">
                        {item}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={count}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
