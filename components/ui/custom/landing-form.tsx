import Image from "next/image";
import { JSX, ReactNode } from "react";

interface LandingFormProps {
  title: string;
  children: ReactNode;
}

// export default async function LandingForm( title: string, Children: React.ReactNode) {
export default function LandingForm({
  title,
  children,
}: LandingFormProps): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/Login_background.jpg')] bg-center bg-no-repeat bg-fixed bg-cover bg-[#669999] bg-blend-screen text-[#3f3f3f] font-light text-[1rem/1.5]">
      {/* <div className="mx-auto max-w-[20rem] md:max-w-[25rem] py-[3rem] "> */}
      <div className="mx-auto py-[3rem] max-w-[20rem] md:max-w-full ">
        <div
          className="flex flex-col text-center rounded-lg pt-8 pb-4 px-8 md:pt-16"
          style={{
            boxShadow: "0 0 50px #000",
            backdropFilter: "blur(10px) sepia(40%)",
          }}
        >
          <div className="w-[50%] mx-auto mb-4 md:max-w-[200px] md:mb-8">
            <Image
              src="/images/intra-intema-dark.png"
              alt="Logo IntraIntema"
              width={684}
              height={254}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col flex-grow">
            <h2 className="text-[2rem] font-extralight mb-2">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
