import { CodeBlockDemo } from "../Code_Block";
import images from '../../assets/index'
export const GemX = () => {
  return (<>       
        <div
          className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4">
          <p
            className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700">
            GemX is an innovative application designed to provide users with dynamic and interactive responses based on their prompts. With features ranging from text and voice interaction to video calls and travel planning, GemX is your versatile AI companion.
            </span>{" "}
            
            <div>
            <br/>GitHub:
            </div>
            <CodeBlockDemo name={'GitHub Link'} syntax={'https://github.com/1-Rishav/GeminiAI'}/>
            WebSite:
            <CodeBlockDemo name={'WebSite Link'} syntax={'https://gem-x.vercel.app/app'}/>
          </p>
          <img
            src={images.Gem2}
            alt="GemX Image"
            height="500"
            width="500"
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-10" />
        </div>
  </>);
};

export const QuickFundz = () => {
  return (<>
        <div
          className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4">
          <p
            className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700">
            A web application designed to simplify peer-to-peer lending with security, transparency, and flexibility. It connects verified borrowers and lenders, allowing seamless loan requests, negotiations, and secure transactions.
            </span>{" "}
            <br/>GitHub:
            <CodeBlockDemo name={'GitHub Link'} syntax={'https://github.com/1-Rishav/Quick_Fundz'}/>
            WebSite:
            <CodeBlockDemo name={'WebSite Link'} syntax={'https://quick-fundz.vercel.app/auth/home'}/>

          </p>
          <img
            src={images.Project1}
            alt="QuickFundz Image"
            height="500"
            width="500"
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-10" />
        </div>
  </>);
};

export const Advertise = () => {
  return (<>        
        <div
          className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4">
          <p
            className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700">
            A web application designed to simplify peer-to-peer lending with security, transparency, and flexibility. It connects verified borrowers and lenders, allowing seamless loan requests, negotiations, and secure transactions.            </span>{" "}
            <br/>GitHub:
            <CodeBlockDemo name={'GitHub Link'} syntax={'https://github.com/1-Rishav/Quick_Fundz'}/>
            WebSite:
            <CodeBlockDemo name={'WebSite Link'} syntax={'https://quick-fundz.vercel.app/auth/home'}/>
          </p>
          <img
            src={images.Project3}
            alt="Brand Fusion Image"
            height="500"
            width="500"
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain" />
        </div>
  </>);
};

export const GeoPix = () => {
    return (<>          
          <div
            className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4">
            <p
              className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700">
              A web application designed to simplify peer-to-peer lending with security, transparency, and flexibility. It connects verified borrowers and lenders, allowing seamless loan requests, negotiations, and secure transactions.            </span>{" "}
            <br/>GitHub:
            <CodeBlockDemo name={'GitHub Link'} syntax={'https://github.com/1-Rishav/Quick_Fundz'}/>
            WebSite:
            <CodeBlockDemo name={'WebSite Link'} syntax={'https://quick-fundz.vercel.app/auth/home'}/>
            </p>
            <img
              src={images.Project10}
              alt="GeoPix Image"
              height="500"
              width="500"
              className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain" />
          </div>
    </>);
  };