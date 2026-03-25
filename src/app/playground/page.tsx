import { CodePlayground } from "@/components/playground/CodePlayground";

export const metadata = {
  title: "JS 練習場 — JS 觀念複習",
  description: "內建 JavaScript 程式練習場，隨時打 code 跑結果",
};

export default function PlaygroundPage() {
  return (
    <div className="h-[calc(100dvh-64px-56px)] md:h-[calc(100dvh-64px)]">
      <CodePlayground />
    </div>
  );
}
