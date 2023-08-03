import { FC, useCallback, useState } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

export interface CatMergeModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
    handleMerge?: () => void
}

const CatMergeModal: FC<CatMergeModalProps> = ({
  modalContent,
  handleMerge,
  ...rest
}) => {
  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleMerge}
      modalContent={
        <>
          <div>
            <h1>Kas oled kindel, et soovid failid kokku liita?</h1>
          </div>
        </>
      }
    />
  )
}

export default CatMergeModal
