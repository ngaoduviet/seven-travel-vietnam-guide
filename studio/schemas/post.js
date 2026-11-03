import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Travel Journal Articles',
  type: 'document',
  fields: [
    defineField({name:'title', title:'Article title', type:'string', validation:Rule=>Rule.required().min(12).max(110)}),
    defineField({name:'slug', title:'SEO URL slug', type:'slug', options:{source:'title',maxLength:96}, validation:Rule=>Rule.required()}),
    defineField({name:'excerpt', title:'Short summary / SEO description', type:'text', rows:3, validation:Rule=>Rule.required().min(55).max(220)}),
    defineField({name:'category', title:'Article category', type:'string', options:{list:[
      {title:'Travel Essentials',value:'travel-essentials'},
      {title:'Destinations',value:'destinations'},
      {title:'Culture & Food',value:'culture-food'},
      {title:'Itinerary Ideas',value:'itineraries'},
      {title:'Travel Updates',value:'travel-updates'},
    ]}, validation:Rule=>Rule.required()}),
    defineField({name:'featured',title:'Feature on homepage',type:'boolean',initialValue:false}),
    defineField({name:'coverImage',title:'Cover photograph',type:'image',options:{hotspot:true},fields:[
      defineField({name:'alt',title:'Descriptive alt text',type:'string',validation:Rule=>Rule.required()})
    ],validation:Rule=>Rule.required()}),
    defineField({name:'author',title:'Author / reviewed by',type:'string',initialValue:'Seven Travel Editorial Team'}),
    defineField({name:'publishedAt',title:'Publication date',type:'datetime',validation:Rule=>Rule.required()}),
    defineField({name:'readingTime',title:'Estimated reading time (minutes)',type:'number',initialValue:5,validation:Rule=>Rule.min(1).max(40)}),
    defineField({name:'body',title:'Article content',type:'array',validation:Rule=>Rule.required().min(1),of:[
      {type:'block',styles:[
        {title:'Paragraph',value:'normal'},
        {title:'Heading 2',value:'h2'},
        {title:'Heading 3',value:'h3'}
      ],marks:{decorators:[{title:'Bold',value:'strong'},{title:'Italic',value:'em'}],annotations:[{name:'link',type:'object',title:'Link',fields:[{name:'href',title:'URL',type:'url'}]}]}},
      {type:'image',options:{hotspot:true},fields:[
        {name:'alt',title:'Alt text',type:'string'},
        {name:'caption',title:'Photo caption',type:'string'}
      ]}
    ]})
  ],
  preview: {
    select: {title:'title',subtitle:'category',media:'coverImage'},
    prepare: ({title,subtitle,media})=>({title,subtitle,media}),
  }
})
