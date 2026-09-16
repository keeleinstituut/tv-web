import { FC, SVGProps } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { IconProps } from 'components/molecules/Button/Button'
import QuestionMark from 'assets/icons/question_mark.svg?react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import ReactHtmlParser from 'html-react-parser'
import manual from 'static/manual.json'
import translationAgencyManual from 'static/translationAgencyManual.json'
import { useAuth } from 'components/contexts/AuthContext'

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
  const { isTranslationAgency } = useAuth()

  const helpSectionsData: HelpSections = isTranslationAgency
    ? translationAgencyManual
    : manual

  const selectedHelpSection = helpSectionsData[helpSectionKey] || {}

  const handleModalOpen = () => {
    showModal(ModalTypes.Tooltip, {
      title: selectedHelpSection.title || '',
      textButtonContent: textButtonContent || t('button.look_at_tutorial'),
      modalContent: ReactHtmlParser(selectedHelpSection.tooltipContent || ''),
      href: `/manual#${helpSectionKey}`,
    })
  }

  return (
    <BaseButton
      onClick={handleModalOpen}
      className={classNames(classes.container, className)}
      aria-label={t('label.tooltip')}
    >
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Tooltip
