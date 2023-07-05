import { FC } from 'react'

import classes from './classes.module.scss'
import LandingContent from 'components/organisms/LandingContent/LandingContent'

const Landing: FC = () => {
  return (
    <main className={classes.container}>
      <LandingContent />
    </main>
  )
}

export default Landing
