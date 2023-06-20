import { FC, PropsWithChildren, SVGProps } from 'react'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'
import TooltipModal from 'components/organisms/modals/TooltipModal/TooltipModal'

export interface ButtonProps extends BaseButtonProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  textButtonContent?: string
  modalContent?: string
  open?: boolean
  handleModalClose?: () => void
  handleModalOpen?: () => void
  openTooltip?: boolean
  setTooltipOpen: (openTooltip: boolean) => void
}

export type IconProps = {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, ariaLabel }) => {
  if (!IconComponent) return null
  return <IconComponent aria-label={ariaLabel} />
}

const Tooltip: FC<PropsWithChildren<ButtonProps>> = ({
  icon,
  ariaLabel,
  href,
  title,
  textButtonContent,
  modalContent,
  open,
  //   handleModalClose,
  openTooltip,
  handleModalOpen,
  setTooltipOpen,
}) => {
  const handleModalClose = () => {
    console.log('openTooltip Close', openTooltip)
    setTooltipOpen(false)
  }

  return (
    <>
      <BaseButton onClick={handleModalOpen}>
        <Icon icon={icon} ariaLabel={ariaLabel} />
      </BaseButton>
      <TooltipModal
        handleModalClose={handleModalClose}
        open={open}
        title={title}
        textButtonContent={textButtonContent}
        modalContent={modalContent}
        href={href}
      />
    </>
  )
}

export default Tooltip
