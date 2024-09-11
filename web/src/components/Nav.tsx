import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-white"
      : "border-transparent hover:border-white";
  return (
    <nav
      class=""
      style={{
        background: "#0ea5e9",
      }}
    >
      <ul class="flex items-center p-3 text-white">
        <li class={`border-b-2 ${active("/college-job")} mx-1.5 sm:mx-6`}>
          <a href="/college-job">大学就业信息</a>
        </li>
        <li class={`border-b-2 ${active("/scores")} mx-1.5 sm:mx-6`}>
          <a href="/scores">不同分数段大学的就业地区</a>
        </li>
        <li class={`border-b-2 ${active("/major-job")} mx-1.5 sm:mx-6`}>
          <a href="/major-job">专业就业信息</a>
        </li>
        <li class={`border-b-2 ${active("/college-type")} mx-1.5 sm:mx-6`}>
          <a href="/college-type">大学类型就业信息</a>
        </li>
      </ul>
    </nav>
  );
}
