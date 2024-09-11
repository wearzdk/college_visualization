import { createEffect, createSignal, onMount, Show } from "solid-js";
import EmploymentInfoCharts from "../components/college-job/EmploymentInfoCharts";
import AutoComplete from "../components/AutoComplete";

interface CollegeJobCompany {
  college_name: string;
  job_attr: string;
  job_company: string;
}

interface CollegeJobArea {
  college_name: string;
  area: string;
  rate: number;
}

export default function Home() {
  const [collegeName, setCollegeName] = createSignal("北京大学");
  const [collegeInput, setCollegeInput] = createSignal("北京大学");
  const [collegeNames, setCollegeNames] = createSignal<string[]>([]);
  const [data, setData] = createSignal<CollegeJobCompany[]>([]);
  const [jobArea, setJobArea] = createSignal<CollegeJobArea[]>([]);
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    fetch("/api/all-college-names")
      .then((res) => res.json())
      .then((data) => setCollegeNames(data as string[]))
      .finally(() => setLoading(false));
  });

  createEffect(() => {
    setLoading(true);
    fetch(`/api/university-employment-info?college_name=${collegeName()}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setLoading(false));

    fetch(`/api/college-job-area?college_name=${collegeName()}`)
      .then((res) => res.json())
      .then((data) => setJobArea(data))
      .finally(() => setLoading(false));
  });

  return (
    <main class="mx-auto text-gray-700 p-4">
      <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">
        大学就业信息
      </h1>
      <div class="flex flex-col items-center">
        <div class="flex mt-2 w-full max-w-md">
          <AutoComplete
            class="flex-grow"
            inputClass="w-full border-2 border-blue-300 focus:border-blue-500 active:border-blue-500 rounded-l-lg shadow-sm px-4 py-2 text-sm"
            type="text"
            placeholder="请输入大学名称"
            onInput={(e) => setCollegeInput(e)}
            value={collegeName()}
            suggestionsList={collegeNames()}
            onSelect={(value) => setCollegeName(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCollegeName(collegeInput());
              }
            }}
          />
          <button
            onClick={() => setCollegeName(collegeInput())}
            class="ml-0 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-r-lg transition duration-300 ease-in-out"
          >
            查询
          </button>
        </div>
      </div>

      <Show when={data() && data().length > 0}>
        <div class="grid grid-cols-2 gap-4 mt-10">
          <EmploymentInfoCharts
            collegeName={collegeName()}
            jobAttr={data()[0].job_attr}
            jobCompany={data()[0].job_company}
            jobArea={jobArea()}
          />
        </div>
      </Show>
      <Show when={loading()}>
        <div>加载中...</div>
      </Show>
    </main>
  );
}
