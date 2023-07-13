import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TagsCheatSheet from 'components/molecules/cheatSheets/TagManagementCheatSheet'

import classes from './classes.module.scss'
import Container from 'components/atoms/Container/Container'

const Tags: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.tagsHeader}>
        <h1>{t('tag.tag_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<TagsCheatSheet />}
        />
      </div>
      <Container className={classes.tagsContainer}>
        <div className={classes.gridItemOne}>
          <h4 className={classes.addingTag}>Sildi lisamine</h4>
          <p>Nimeta uus silt ja vali selle asukoht</p>
        </div>
        <div className={classes.separator} />
        <div className={classes.gridItemTwo}>Bu</div>
        <div className={classes.gridItemOne}>Bu</div>
      </Container>
    </>
  )
}

export default Tags
