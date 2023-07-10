import { FC, ReactElement, SVGProps } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as QuestionMark } from 'assets/icons/question_mark.svg'
import classNames from 'classnames'

import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'

interface TooltipProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  textButtonContent?: string
  modalContent?: ReactElement | string
  title?: string
  href?: string
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
  title,
  textButtonContent,
  modalContent,
  href = '/manual',
}) => {
  const { t } = useTranslation()
  const handleModalOpen = () => {
    showModal(ModalTypes.Tooltip, {
      title: title,
      textButtonContent: textButtonContent || t('button.look_at_tutorial'),
      modalContent: modalContent,
      href: href,
    })
  }

  return (
    <BaseButton onClick={handleModalOpen} className={classes.container}>
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Tooltip
