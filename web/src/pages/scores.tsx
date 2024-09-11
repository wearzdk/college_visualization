import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { EChartsAutoSize } from "echarts-solid";
import { EChartsOption } from "echarts";

const scoreRanges = [
  "510-530",
  "530-550",
  "550-570",
  "570-590",
  "590-610",
  "610-630",
  "630-650",
  "650-670",
  "670-690",
];

export default function Home() {
  // 高校分数线与毕业生就业情况关联
  const [employmentData, setEmploymentData] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    setLoading(true);
    fetch(`/api/college-scores-and-graduates-employment`)
      .then((res) => res.json())
      .then((data) => setEmploymentData(data))
      .finally(() => setLoading(false));
  });

  // 不同分数段大学的就业地区
  const [areaData, setAreaData] = createSignal<any[]>([]);
  const [areaLoading, setAreaLoading] = createSignal(false);

  createEffect(() => {
    setAreaLoading(true);
    fetch(`/api/college-job-area-by-score`)
      .then((res) => res.json())
      .then((data) => setAreaData(data))
      .finally(() => setAreaLoading(false));
  });
  // 就业情况的 chart options
  const employmentChartOptions = createMemo<EChartsOption>(() => {
    return {
      title: {
        text: "不同分数线高校的毕业生就业情况",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      legend: {
        data: ["国有企业比例", "民营企业比例"],
        top: 30,
      },
      xAxis: {
        type: "category",
        data: scoreRanges,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
        },
      },
      series: [
        {
          name: "国有企业比例",
          type: "line",
          data: employmentData().map((item) =>
            (item.state_owned_ratio * 100).toFixed(2)
          ),
          smooth: true,
        },
        {
          name: "民营企业比例",
          type: "line",
          data: employmentData().map((item) =>
            (item.private_ratio * 100).toFixed(2)
          ),
          smooth: true,
        },
      ],
    };
  });
  // 不同分数段大学的就业地区
  const areaChartOptions = createMemo<EChartsOption[]>(() => {
    return areaData().map((item) => ({
      title: {
        text: `${item.score_range}分数段高校毕业生就业地区分布`,
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "就业地区",
          type: "pie",
          radius: "50%",
          data: item.areas.map((area: any) => ({
            name: area.area,
            value: (area.rate * 100).toFixed(2),
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    }));
  });

  return (
    <main class="mx-auto text-gray-700 p-4">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
        高校分数线与就业情况分析
      </h1>
      <Show when={!loading() && employmentData().length > 0}>
        <div class="mt-4 w-full h-450px">
          <EChartsAutoSize option={employmentChartOptions()} />
        </div>
      </Show>
      <Show when={!areaLoading() && areaData().length > 0}>
        <div class="mt-4 w-full grid grid-cols-3 gap-4">
          <For each={areaChartOptions()}>
            {(option) => (
              <div class="h-220px w-full">
                <EChartsAutoSize option={option} />
              </div>
            )}
          </For>
        </div>
      </Show>
      <Show when={loading()}>
        <div>加载中...</div>
      </Show>
    </main>
  );
}
