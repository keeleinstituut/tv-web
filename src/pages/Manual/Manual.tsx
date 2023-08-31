import { map } from 'lodash'
import { FC, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import useHashState from 'hooks/useHashState'

import classes from './classes.module.scss'

const Manual: FC = () => {
  const { t } = useTranslation()

  const manualContentArray = [
    {
      id: '1',
      label: '1. Title',
      content:
        '1. Lorem ipsum dolor sit amet consectetur. Nulla nunc ut id consectetur. Blandit ultricies aenean aenean duis adipiscing iaculis ipsum. Dis semper pellentesque cursus et ultrices amet tincidunt sollicitudin. Vitae convallis ut pellentesque cursus integer aliquam rhoncus mollis. Nunc consectetur eget quam vel sodales. Magna ut fames ipsum non. Laoreet fames vivamus nunc ac mauris a ultrices dolor nunc. Donec vulputate lacus nibh arcu. Ullamcorper purus est eget mattis suspendisse neque ac sed. Aliquam nunc et consectetur eu sit egestas dictum lectus tincidunt. Quis amet consequat mauris ipsum est eu lacus. Volutpat arcu diam cum proin ornare. Ultricies nam sed ultrices pretium sed risus mauris. Porta mi augue tristique et mauris enim adipiscing tristique. Parturient viverra tortor interdum id molestie eget. Purus diam sagittis accumsan donec. Eu et euismod sapien suspendisse auctor vitae elit mauris ultricies. Eget senectus pellentesque velit tincidunt sed volutpat massa etiam purus. Vel tortor tempor in amet sed consectetur viverra odio. Dictum ullamcorper tortor in vitae risus pellentesque. Fermentum nibh in curabitur congue tellus sit enim ornare in. Bibendum mi sed faucibus imperdiet urna molestie adipiscing. At facilisis nunc etiam phasellus. Elementum tempus vel ipsum elementum vel nisl urna in. Aliquam sit mauris nibh netus eu tincidunt dui nec. Cursus congue in vitae laoreet sit. At semper eu viverra sapien praesent nunc bibendum tempus amet. Vestibulum tempus amet at duis. In id purus vitae in. Dolor diam donec tristique euismod. Sed magna orci convallis magna in scelerisque fusce lectus. Odio natoque in at sit gravida faucibus nunc. Elit enim porttitor placerat sagittis aliquam eget massa gravida. Amet neque eu nibh tristique donec sem. Pellentesque gravida tortor a sem et rhoncus dictumst lorem consequat.',
    },
    { id: '2', label: '2. Title', content: '' },
    { id: '3', label: '3. Title', content: '' },
    {
      id: '4',
      label: '4. Title',
      content:
        '4. Lorem ipsum dolor sit amet consectetur. Nulla nunc ut id consectetur. Blandit ultricies aenean aenean duis adipiscing iaculis ipsum. Dis semper pellentesque cursus et ultrices amet tincidunt sollicitudin. Vitae convallis ut pellentesque cursus integer aliquam rhoncus mollis. Nunc consectetur eget quam vel sodales. Magna ut fames ipsum non. Laoreet fames vivamus nunc ac mauris a ultrices dolor nunc. Donec vulputate lacus nibh arcu. Ullamcorper purus est eget mattis suspendisse neque ac sed. Aliquam nunc et consectetur eu sit egestas dictum lectus tincidunt. Quis amet consequat mauris ipsum est eu lacus. Volutpat arcu diam cum proin ornare. Ultricies nam sed ultrices pretium sed risus mauris. Porta mi augue tristique et mauris enim adipiscing tristique. Parturient viverra tortor interdum id molestie eget. Purus diam sagittis accumsan donec. Eu et euismod sapien suspendisse auctor vitae elit mauris ultricies. Eget senectus pellentesque velit tincidunt sed volutpat massa etiam purus. Vel tortor tempor in amet sed consectetur viverra odio. Dictum ullamcorper tortor in vitae risus pellentesque. Fermentum nibh in curabitur congue tellus sit enim ornare in. Bibendum mi sed faucibus imperdiet urna molestie adipiscing. At facilisis nunc etiam phasellus. Elementum tempus vel ipsum elementum vel nisl urna in. Aliquam sit mauris nibh netus eu tincidunt dui nec. Cursus congue in vitae laoreet sit. At semper eu viverra sapien praesent nunc bibendum tempus amet. Vestibulum tempus amet at duis. In id purus vitae in. Dolor diam donec tristique euismod. Sed magna orci convallis magna in scelerisque fusce lectus. Odio natoque in at sit gravida faucibus nunc. Elit enim porttitor placerat sagittis aliquam eget massa gravida. Amet neque eu nibh tristique donec sem. Pellentesque gravida tortor a sem et rhoncus dictumst lorem consequat.',
    },
    { id: '5', label: '5. Title', content: '' },
    { id: '6', label: '6. Title', content: '' },
    {
      id: '7',
      label: '7. Title',
      content:
        ' 7. Lorem ipsum dolor sit amet consectetur. Nulla nunc ut id consectetur. Blandit ultricies aenean aenean duis adipiscing iaculis ipsum. Dis semper pellentesque cursus et ultrices amet tincidunt sollicitudin. Vitae convallis ut pellentesque cursus integer aliquam rhoncus mollis. Nunc consectetur eget quam vel sodales. Magna ut fames ipsum non. Laoreet fames vivamus nunc ac mauris a ultrices dolor nunc. Donec vulputate lacus nibh arcu. Ullamcorper purus est eget mattis suspendisse neque ac sed. Aliquam nunc et consectetur eu sit egestas dictum lectus tincidunt. Quis amet consequat mauris ipsum est eu lacus. Volutpat arcu diam cum proin ornare. Ultricies nam sed ultrices pretium sed risus mauris. Porta mi augue tristique et mauris enim adipiscing tristique. Parturient viverra tortor interdum id molestie eget. Purus diam sagittis accumsan donec. Eu et euismod sapien suspendisse auctor vitae elit mauris ultricies. Eget senectus pellentesque velit tincidunt sed volutpat massa etiam purus. Vel tortor tempor in amet sed consectetur viverra odio. Dictum ullamcorper tortor in vitae risus pellentesque. Fermentum nibh in curabitur congue tellus sit enim ornare in. Bibendum mi sed faucibus imperdiet urna molestie adipiscing. At facilisis nunc etiam phasellus. Elementum tempus vel ipsum elementum vel nisl urna in. Aliquam sit mauris nibh netus eu tincidunt dui nec. Cursus congue in vitae laoreet sit. At semper eu viverra sapien praesent nunc bibendum tempus amet. Vestibulum tempus amet at duis. In id purus vitae in. Dolor diam donec tristique euismod. Sed magna orci convallis magna in scelerisque fusce lectus. Odio natoque in at sit gravida faucibus nunc. Elit enim porttitor placerat sagittis aliquam eget massa gravida. Amet neque eu nibh tristique donec sem. Pellentesque gravida tortor a sem et rhoncus dictumst lorem consequat.',
    },
    { id: '8', label: '8. Title', content: '' },
    { id: '9', label: '9. Title', content: '' },
    { id: '10', label: '10. Title', content: '' },
  ]

  const { setHash, currentHash } = useHashState()

  const handleTitleClick = useCallback(
    (id: string) => {
      setHash(id)
      scrollToElement(id)
    },
    [setHash]
  )

  const scrollToElement = (id: string) => {
    const matchingElement = document.getElementById(id)
    if (matchingElement) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  useEffect(() => {
    scrollToElement(currentHash)
  }, [currentHash])

  const manualContent = map(manualContentArray, ({ id, label, content }) => {
    return (
      <div key={id} id={id}>
        <h2>{label}</h2>
        <p>{content}</p>
      </div>
    )
  })

  const manualTitle = map(manualContentArray, ({ id, label }) => {
    return (
      <BaseButton
        key={id}
        onClick={() => handleTitleClick(id)}
        className={
          currentHash === id ? classes.activeTitle : classes.manualTitle
        }
      >
        {label}
      </BaseButton>
    )
  })

  return (
    <div className={classes.manualContainer}>
      <h1 className={classes.title}>{t('menu.manual')}</h1>
      <div className={classes.manualContent}>{manualContent}</div>
      <div className={classes.manualTitleContainer}>
        <p className={classes.tableOfContents}>{t('menu.table_of_contents')}</p>
        <p className={classes.manualTitles}>{manualTitle}</p>
      </div>
    </div>
  )
}

export default Manual
