import { EChartsOption } from "echarts";
import { EChartsAutoSize } from "echarts-solid";
import {
  createEffect,
  createMemo,
  createSignal,
  onMount,
  Show,
} from "solid-js";
import AutoComplete from "../components/AutoComplete";

export default function MajorJob() {
  const [majorName, setMajorName] = createSignal<string>("哲学");
  const [majorNameInput, setMajorNameInput] = createSignal<string>("哲学");
  const [majorNames, setMajorNames] = createSignal<string[]>([]);
  const [majorJobData, setMajorJobData] = createSignal<{
    major_name: string;
    area_info: {
      area_name: string;
      rate: number;
    }[];
    position_info: {
      position_name: string;
      rate: number;
    }[];
    industry_info: {
      industry_name: string;
      rate: number;
    }[];
  }>();

  onMount(() => {
    fetch("/api/all-major-names")
      .then((res) => res.json())
      .then((data) => setMajorNames(data));
  });

  const fetchMajorJobData = async () => {
    const response = await fetch(
      `/api/major-job-info?major_name=${majorName()}`
    );
    const data = await response.json();
    setMajorJobData(data);
  };
  createEffect(() => {
    fetchMajorJobData();
  });

  const majorJobOptions = createMemo(() => {
    if (!majorJobData()) return {};

    const { area_info, position_info, industry_info } = majorJobData()!;

    const jobOption: EChartsOption = {
      title: { text: "就业地区分布", left: "center" },
      tooltip: { trigger: "item", formatter: "{b}: {c}% ({d}%)" },
      series: [
        {
          type: "pie",
          radius: "50%",
          data: area_info.map((item) => ({
            value: item.rate,
            name: item.area_name,
          })),
          label: {
            show: true,
            formatter: "{b}: {c}%",
          },
        },
      ],
    };

    const positionOption: EChartsOption = {
      title: { text: "就业职位分布", left: "center" },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
        },
      },
      yAxis: {
        type: "category",
        data: position_info.map((item) => item.position_name),
        inverse: true,
        axisLabel: {
          width: 100,
          overflow: "break",
        },
      },
      grid: {
        left: "20%",
        right: "10%",
      },
      series: [
        {
          type: "bar",
          data: position_info.map((item) => item.rate),
          label: {
            show: true,
            position: "right",
            formatter: "{c}%",
          },
        },
      ],
    };

    const industryOption: EChartsOption = {
      title: { text: "就业行业分布", left: "center" },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: industry_info.map((item) => ({
            value: item.rate,
            name: item.industry_name,
          })),
          label: {
            show: true,
            formatter: "{b}: {c}%",
          },
        },
      ],
    };

    return { jobOption, positionOption, industryOption };
  });

  return (
    <main class="mx-auto text-gray-700 p-4">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
        专业就业信息
      </h1>
      <div class="flex flex-col items-center">
        <div class="flex mt-2 w-full max-w-md">
          <AutoComplete
            class="flex-grow"
            inputClass="w-full border-2 border-blue-300 focus:border-blue-500 active:border-blue-500 rounded-l-lg shadow-sm px-4 py-2 text-sm"
            type="text"
            placeholder="请输入专业名称"
            suggestionsList={majorNames()}
            onInput={(e) => setMajorNameInput(e)}
            value={majorNameInput()}
            onSelect={(value) => setMajorName(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setMajorName(majorNameInput());
              }
            }}
          />
          <button
            onClick={() => setMajorName(majorNameInput())}
            class="ml-0 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-r-lg transition duration-300 ease-in-out"
          >
            查询
          </button>
        </div>
      </div>

      <Show when={majorJobData()} fallback={<div>暂无数据</div>}>
        <div class="grid grid-cols-3 gap-4 mt-10">
          <div class="w-full h-400px">
            <EChartsAutoSize option={majorJobOptions().jobOption!} />
          </div>
          <div class="w-full h-400px">
            <EChartsAutoSize option={majorJobOptions().positionOption!} />
          </div>
          <div class="w-full h-400px">
            <EChartsAutoSize option={majorJobOptions().industryOption!} />
          </div>
        </div>
      </Show>
    </main>
  );
}
