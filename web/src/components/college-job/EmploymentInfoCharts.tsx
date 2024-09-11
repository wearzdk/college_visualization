import { EChartsOption } from "echarts";
import { EChartsAutoSize } from "echarts-solid";
import { createMemo, Show } from "solid-js";

export default function EmploymentInfoCharts(props: {
  collegeName: string;
  jobAttr: string;
  jobCompany: string;
  jobArea: {
    college_name: string;
    area: string;
    rate: number;
  }[];
}) {
  const jobAttr = createMemo(() => {
    return JSON.parse(props.jobAttr.replaceAll("'", '"')) as Record<
      string,
      number
    >;
  });

  const jobCompany = createMemo(() => {
    return JSON.parse(props.jobCompany.replaceAll("'", '"')) as Record<
      string,
      number
    >;
  });

  const options = createMemo<EChartsOption>(() => {
    const data = Object.entries(jobAttr());
    return {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "就业属性",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "18",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map(([key, value]) => ({
            name: key,
            value,
          })),
        },
      ],
      legend: {
        orient: "vertical",
        left: "left",
        data: data.map(([key]) => key),
      },
    };
  });

  const companyOptions = createMemo<EChartsOption>(() => {
    const data = Object.entries(jobCompany())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: "category",
        data: data.map((item) => item[0]),
        inverse: true,
        axisLabel: {
          width: 120,
          overflow: "break",
        },
      },
      grid: {
        left: "20%",
        right: "10%",
      },
      series: [
        {
          name: "就业公司",
          type: "bar",
          data: data.map((item) => item[1]),
          itemStyle: {
            color: function (params) {
              const colorList = [
                "#c23531",
                "#2f4554",
                "#61a0a8",
                "#d48265",
                "#91c7ae",
                "#749f83",
                "#ca8622",
                "#bda29a",
                "#6e7074",
                "#546570",
              ];
              return colorList[params.dataIndex % colorList.length];
            },
          },
        },
      ],
    };
  });

  const area = createMemo(() => {
    return props.jobArea.map((item) => ({
      name: item.area,
      value: item.rate,
    }));
  });

  const areaOptions = createMemo<EChartsOption>(() => {
    const data = area()
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "value",
        name: "比例 (%)",
      },
      yAxis: {
        type: "category",
        data: data.map((item) => item.name),
        inverse: true,
      },
      series: [
        {
          name: "就业地区",
          type: "bar",
          data: data.map((item) => item.value),
          label: {
            show: true,
            position: "right",
            formatter: "{c}%",
          },
          itemStyle: {
            color: function (params) {
              const colorList = [
                "#c23531",
                "#2f4554",
                "#61a0a8",
                "#d48265",
                "#91c7ae",
                "#749f83",
                "#ca8622",
                "#bda29a",
                "#6e7074",
                "#546570",
              ];
              return colorList[params.dataIndex % colorList.length];
            },
          },
        },
      ],
    };
  });

  return (
    <>
      <div class="h-450px flex flex-col">
        <Show when={Object.keys(jobAttr()).length > 0}>
          <h2 class="text-lg font-bold text-center mb-2">
            {props.collegeName}就业信息
          </h2>
          <EChartsAutoSize option={options()} />
        </Show>
      </div>
      <div class="h-450px flex flex-col">
        <Show when={Object.keys(jobCompany()).length > 0}>
          <h2 class="text-lg font-bold text-center mb-2">
            {props.collegeName}就业公司去向（前10名）
          </h2>
          <EChartsAutoSize option={companyOptions()} />
        </Show>
      </div>
      <div class="h-450px flex flex-col">
        <Show when={Object.keys(area()).length > 0}>
          <h2 class="text-lg font-bold text-center mb-2">
            {props.collegeName}就业地区去向（前10名）
          </h2>
          <EChartsAutoSize option={areaOptions()} />
        </Show>
      </div>
    </>
  );
}
