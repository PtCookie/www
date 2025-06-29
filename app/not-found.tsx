import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid grow items-center justify-items-center">
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-4xl font-bold">Not Found</h2>
        <Link href="/">Return Home</Link>
      </div>
    </div>
  );
}
