import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts";
import style from "./index.module.scss";
import { FC } from "react";

interface LineChartInterface {
  dataSeries: number[][];
  xAxisPoints: string[];
}

export const LineGraph: FC<LineChartInterface> = ({
  dataSeries,
  xAxisPoints,
}) => {
  return (
    <Box className={style.box}>
      <LineChart
        xAxis={[
          {
            data: xAxisPoints,
            position: "bottom",
            scaleType: "point",
          },
        ]}
        series={dataSeries.map((item) => {
          return {
            data: item,
          };
        })}
        height={300}
      />
    </Box>
  );
};
