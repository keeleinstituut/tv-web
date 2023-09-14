import { FC, SVGProps } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as QuestionMark } from 'assets/icons/question_mark.svg'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import ReactHtmlParser from 'html-react-parser'
import helpSections from 'pages/Manual/helpSections.json'

import classes from './classes.module.scss'

export interface HelpSections {
  [key: string]: {
    title: string
    content: string
    tooltipContent?: string
  }
}

interface TooltipProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  textButtonContent?: string
  helpSectionKey: string
  className?: string
}

const Icon: FC<IconProps> = ({
  icon: IconComponent = QuestionMark,
  ariaLabel,
  className,
}) => {
  const { t } = useTranslation()
  if (!IconComponent) return null
  return (
    <IconComponent
      aria-label={ariaLabel || t('label.open_instructions')}
      className={classNames(classes.infoIcon, className)}
    />
  )
}

const Tooltip: FC<TooltipProps> = ({
  icon,
  ariaLabel,
  textButtonContent,
  helpSectionKey,
  className,
}) => {
  const { t } = useTranslation()

  const helpSectionsData: HelpSections = helpSections

  const selectedHelpSection = helpSectionsData[helpSectionKey] || {}

  const handleModalOpen = () => {
    showModal(ModalTypes.Tooltip, {
      title: selectedHelpSection.title || '',
      textButtonContent: textButtonContent || t('button.look_at_tutorial'),
      modalContent: ReactHtmlParser(selectedHelpSection.tooltipContent || ''),
      href: `/manual#${helpSectionKey}`,
      className: className,
    })
  }

  return (
    <BaseButton onClick={handleModalOpen} className={classes.container}>
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Tooltip
