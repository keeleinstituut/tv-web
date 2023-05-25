import { FC } from 'react'

import LandingContent from 'components/organisms/LandingContent/LandingContent'
import classes from './styles.module.scss'

const Dashboard: FC = () => {
  return <LandingContent className={classes.landingContent} />
}

export default Dashboard
