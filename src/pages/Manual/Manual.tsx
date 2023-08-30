import { map } from 'lodash'
import { FC } from 'react'
import classes from './classes.module.scss'

// TODO: WIP - implement this page

const Manual: FC = () => {
  const manualContentArray = [
    {
      id: '1',
      label: 'Üldinfo1',
      content:
        '1. Lorem ipsum dolor sit amet consectetur. Nulla nunc ut id consectetur. Blandit ultricies aenean aenean duis adipiscing iaculis ipsum. Dis semper pellentesque cursus et ultrices amet tincidunt sollicitudin. Vitae convallis ut pellentesque cursus integer aliquam rhoncus mollis. Nunc consectetur eget quam vel sodales. Magna ut fames ipsum non. Laoreet fames vivamus nunc ac mauris a ultrices dolor nunc. Donec vulputate lacus nibh arcu. Ullamcorper purus est eget mattis suspendisse neque ac sed. Aliquam nunc et consectetur eu sit egestas dictum lectus tincidunt. Quis amet consequat mauris ipsum est eu lacus. Volutpat arcu diam cum proin ornare. Ultricies nam sed ultrices pretium sed risus mauris. Porta mi augue tristique et mauris enim adipiscing tristique. Parturient viverra tortor interdum id molestie eget. Purus diam sagittis accumsan donec. Eu et euismod sapien suspendisse auctor vitae elit mauris ultricies. Eget senectus pellentesque velit tincidunt sed volutpat massa etiam purus. Vel tortor tempor in amet sed consectetur viverra odio. Dictum ullamcorper tortor in vitae risus pellentesque. Fermentum nibh in curabitur congue tellus sit enim ornare in. Bibendum mi sed faucibus imperdiet urna molestie adipiscing. At facilisis nunc etiam phasellus. Elementum tempus vel ipsum elementum vel nisl urna in. Aliquam sit mauris nibh netus eu tincidunt dui nec. Cursus congue in vitae laoreet sit. At semper eu viverra sapien praesent nunc bibendum tempus amet. Vestibulum tempus amet at duis. In id purus vitae in. Dolor diam donec tristique euismod. Sed magna orci convallis magna in scelerisque fusce lectus. Odio natoque in at sit gravida faucibus nunc. Elit enim porttitor placerat sagittis aliquam eget massa gravida. Amet neque eu nibh tristique donec sem. Pellentesque gravida tortor a sem et rhoncus dictumst lorem consequat.',
    },
    { id: '2', label: 'text', content: '' },
    { id: '3', label: 'Üldinfo2', content: '' },
    {
      id: '4',
      label: 'text',
      content:
        '2. Lorem ipsum dolor sit amet consectetur. Nulla nunc ut id consectetur. Blandit ultricies aenean aenean duis adipiscing iaculis ipsum. Dis semper pellentesque cursus et ultrices amet tincidunt sollicitudin. Vitae convallis ut pellentesque cursus integer aliquam rhoncus mollis. Nunc consectetur eget quam vel sodales. Magna ut fames ipsum non. Laoreet fames vivamus nunc ac mauris a ultrices dolor nunc. Donec vulputate lacus nibh arcu. Ullamcorper purus est eget mattis suspendisse neque ac sed. Aliquam nunc et consectetur eu sit egestas dictum lectus tincidunt. Quis amet consequat mauris ipsum est eu lacus. Volutpat arcu diam cum proin ornare. Ultricies nam sed ultrices pretium sed risus mauris. Porta mi augue tristique et mauris enim adipiscing tristique. Parturient viverra tortor interdum id molestie eget. Purus diam sagittis accumsan donec. Eu et euismod sapien suspendisse auctor vitae elit mauris ultricies. Eget senectus pellentesque velit tincidunt sed volutpat massa etiam purus. Vel tortor tempor in amet sed consectetur viverra odio. Dictum ullamcorper tortor in vitae risus pellentesque. Fermentum nibh in curabitur congue tellus sit enim ornare in. Bibendum mi sed faucibus imperdiet urna molestie adipiscing. At facilisis nunc etiam phasellus. Elementum tempus vel ipsum elementum vel nisl urna in. Aliquam sit mauris nibh netus eu tincidunt dui nec. Cursus congue in vitae laoreet sit. At semper eu viverra sapien praesent nunc bibendum tempus amet. Vestibulum tempus amet at duis. In id purus vitae in. Dolor diam donec tristique euismod. Sed magna orci convallis magna in scelerisque fusce lectus. Odio natoque in at sit gravida faucibus nunc. Elit enim porttitor placerat sagittis aliquam eget massa gravida. Amet neque eu nibh tristique donec sem. Pellentesque gravida tortor a sem et rhoncus dictumst lorem consequat.',
    },
    { id: '5', label: 'text', content: '' },
    { id: '6', label: 'text', content: '' },
    { id: '7', label: 'text', content: '' },
    { id: '8', label: 'text', content: '' },
  ]

  const manualContent = map(manualContentArray, ({ id, label, content }) => {
    return (
      <div key={id}>
        <h2>{label}</h2>
        <p>{content}</p>
      </div>
    )
  })

  const tableOfContents = map(manualContentArray, ({ id, label }) => {
    return (
      <div key={id}>
        <p>{label}</p>
      </div>
    )
  })

  return (
    <div className={classes.manualContainer}>
      <h1 className={classes.title}>Manual</h1>
      <div className={classes.content}>{manualContent}</div>
      <div className={classes.tableOfContents}>{tableOfContents}</div>
    </div>
  )
}

export default Manual
