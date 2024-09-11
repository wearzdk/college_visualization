import { createSignal, For, Show } from "solid-js";

export default function AutoComplete(props: {
  suggestionsList: string[];
  onSelect: (value: string) => void;
  class?: string;
  inputClass?: string;
  placeholder?: string;
  type?: "text" | "number" | "date";
  onInput?: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  value?: string;
}) {
  const [inputValue, setInputValue] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<string[]>([]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      const filteredSuggestions = props.suggestionsList
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10); // 限制最多10个建议
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
    props.onInput?.(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    props.onSelect(suggestion);
    props.onInput?.(suggestion);
  };

  return (
    <div classList={{ relative: true, [props.class || ""]: true }}>
      <input
        type={props.type || "text"}
        value={props.value || inputValue()}
        onInput={(e) => handleInputChange(e.currentTarget.value)}
        placeholder={props.placeholder || "请输入内容"}
        class={props.inputClass}
        onKeyDown={props.onKeyDown}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
      <Show when={suggestions().length > 0}>
        <ul class="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <For each={suggestions()}>
            {(suggestion) => (
              <li
                onClick={() => handleSuggestionClick(suggestion)}
                class="px-4 py-2 hover:bg-gray-100"
                style={{ cursor: "pointer" }}
              >
                {suggestion}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
