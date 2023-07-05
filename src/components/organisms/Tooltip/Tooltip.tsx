import { FC, SVGProps } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as QuestionMark } from 'assets/icons/question_mark.svg'
import classNames from 'classnames'

import classes from './classes.module.scss'

interface TooltipProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  textButtonContent?: string
  modalContent?: string
  title?: string
  href?: string
}

const Icon: FC<IconProps> = ({
  icon: IconComponent = QuestionMark,
  ariaLabel,
  className,
}) => {
  if (!IconComponent) return null
  return (
    <IconComponent
      aria-label={ariaLabel}
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
  href,
}) => {
  const handleModalOpen = () => {
    showModal(ModalTypes.Tooltip, {
      title: title,
      textButtonContent: textButtonContent,
      modalContent: modalContent,
      href: href,
    })
  }

  return (
    <BaseButton onClick={handleModalOpen}>
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Tooltip
