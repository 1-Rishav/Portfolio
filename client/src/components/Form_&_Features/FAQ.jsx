import React from 'react'
import {Accordion, AccordionItem} from "@nextui-org/react";
import { faq } from '../Data/FAQData';
function FAQ() {

  return (
    <Accordion>
      {faq.map((query)=>(
        <AccordionItem key={query.id} aria-label="Accordion 1" className='mb-1  text-xl font-serif font-medium tracking-normal shadow-slate-300 lg:p-1 shadow-inner rounded-lg bg-gray-200' title={query.title}>
        {query.answer}
      </AccordionItem>
      ))      }
      
    </Accordion>
  );

}

export default FAQ