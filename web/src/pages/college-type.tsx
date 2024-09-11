import { EChartsOption } from "echarts";
import { EChartsAutoSize } from "echarts-solid";
import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  Show,
} from "solid-js";

export default function Home() {
  const [jobIndustryData, setJobIndustryData] = createSignal<
    {
      college_type: string;
      job_attrs: { job_attr: string; rate: number }[];
    }[]
  >([]);

  onMount(() => {
    fetch("/api/college-job-industry")
      .then((res) => res.json())
      .then((data) => setJobIndustryData(data));
  });

  const jobIndustryOptions = createMemo<EChartsOption>(() => {
    const collegeTypes = jobIndustryData().map((item) => item.college_type);
    const jobAttrs = Array.from(
      new Set(
        jobIndustryData().flatMap((item) =>
          item.job_attrs.map((attr) => attr.job_attr)
        )
      )
    );
    const series = jobAttrs.map((attr) => ({
      name: attr,
      type: "bar",
      stack: "总量",
      data: jobIndustryData().map((item) => {
        const matchedAttr = item.job_attrs.find((a) => a.job_attr === attr);
        return matchedAttr ? (matchedAttr.rate * 100).toFixed(2) : 0;
      }),
    }));

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        valueFormatter: (value: number) => `${value}%`,
      },
      legend: {
        data: jobAttrs,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: collegeTypes,
      },
      yAxis: {
        type: "value",
        name: "百分比",
        axisLabel: {
          formatter: "{value}%",
        },
      },
      series: series,
    } as EChartsOption;
  });

  createEffect(() => {
    console.log(jobIndustryOptions());
  });
  return (
    <main class="mx-auto text-gray-700 p-4">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
        不同类型大学就业信息
      </h1>
      <Show
        when={jobIndustryData().length > 0}
        fallback={<div>Loading...</div>}
      >
        <div class="mt-4 w-full h-500px">
          <EChartsAutoSize option={jobIndustryOptions()} />
        </div>
      </Show>
    </main>
  );
}
