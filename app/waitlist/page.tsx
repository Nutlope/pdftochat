import Image from 'next/image';

export default function WaitlistPage() {
  return (
    <div className="mt-20 mx-auto text-center">
      <div className="flex items-center justify-center flex-col gap-5">
        <Image src="/box.svg" alt="logo" width={200} height={200} />
        <div className="font-bold text-4xl">PdftoChat</div>
      </div>

      <div className="mt-36 text-center prose mx-auto">
        <h1 className="lg:text-5xl text-3xl font-bold">
          Stop being sneaky and just wait till Monday.
        </h1>
        <h3 className="lg:text-xl text-lg text-gray-500 font-normal mt-5">
          Thank you. It&apos;ll be out soon, I promise.
        </h3>
      </div>
    </div>
  );
}
