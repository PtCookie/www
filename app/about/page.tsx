import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="grid grow items-center justify-items-center">
      <div className="flex flex-col items-center justify-center gap-12 py-12 text-center sm:flex-row sm:py-0">
        <div className="flex max-w-2/5 flex-col items-center justify-center overflow-hidden rounded-full sm:rounded-4xl">
          <Image src="/profile.jpg" alt="Profile" width={768} height={256} className="hidden sm:block" />
          <Image src="/profile.png" alt="Profile" width={768} height={256} className="sm:hidden" />
        </div>
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="max-w-3/5 font-sans text-4xl leading-tight font-black sm:max-w-full sm:text-6xl">
            Hello! <br className="sm:hidden" />
            My name is Minsup Ju
          </h1>
          <h2 className="mb-8 max-w-4/5 font-sans text-xl leading-normal font-semibold sm:text-3xl">
            I’ve been working on web development since 2019.
          </h2>
          <p className="text-md font-mono leading-normal font-semibold sm:max-w-4/5 sm:text-xl">
            I’ve been developing with the following...
          </p>
          <div className="mt-8 grid grid-cols-2 items-center justify-center gap-8 sm:grid-cols-3">
            <Link href="https://react.dev/">
              <Image src="/react.svg" alt="React.js" width={128} height={128} className="w-24 sm:w-32" />
            </Link>
            <Link href="https://graphql.org/">
              <Image src="/graphql.svg" alt="GraphQL" width={128} height={128} className="w-24 sm:w-32" />
            </Link>
            <Link href="https://www.electronjs.org/">
              <Image src="/electron.svg" alt="Electron" width={128} height={128} className="w-24 sm:w-32" />
            </Link>
            <Link href="https://www.typescriptlang.org/">
              <Image src="/typescript.svg" alt="TypeScript" width={128} height={128} className="w-24 sm:w-32" />
            </Link>
            <Link href="https://nodejs.org/">
              <Image src="/nodejs.svg" alt="Node.js" width={128} height={128} className="w-24 sm:w-32" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
