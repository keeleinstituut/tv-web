import { FC, SVGProps } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { IconProps } from 'components/molecules/Button/Button'

interface TooltipProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  textButtonContent?: string
  modalContent?: string
  title?: string
  href?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, ariaLabel }) => {
  if (!IconComponent) return null
  return <IconComponent aria-label={ariaLabel} />
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
