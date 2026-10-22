import {Accordion, AccordionItem} from "@heroui/react";
import { faq } from '../Data/FAQData';
import { useSanityList } from '../../hooks/use_sanity_list';

// 4.3: no image/portable-text step needed here, unlike About's tickers (4.2) - faqItem's `question`/`answer`
// are plain strings, the exact shape FAQData.js's `faq` was renamed to match (title -> question), so the
// fallback needs no per-item mapping and can be passed to useSanityList as-is.
const FAQ_QUERY = `*[_type == "faqItem"] | order(displayOrder asc){question, answer}`;

function FAQ() {
  const faqItems = useSanityList(FAQ_QUERY, faq);

  return (
    <Accordion>
      {faqItems.map((query, index)=>(
        <AccordionItem key={index} aria-label="Accordion 1" className='mb-1  text-xl font-serif font-medium tracking-normal shadow-slate-300 lg:p-1 shadow-inner rounded-lg bg-gray-200' title={query.question}>
        {query.answer}
      </AccordionItem>
      ))      }
      
    </Accordion>
  );

}

export default FAQ