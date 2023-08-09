import { FC, useCallback, useState } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

export interface CatSplitModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  handleSplit?: (splitsAmount: number) => void
}

const CatSplitModal: FC<CatSplitModalProps> = ({
  modalContent,
  handleSplit,
  ...rest
}) => {
  const [splitsAmount, setSplitsAmount] = useState(2)

  const handleProceedInternal = useCallback(() => {
    if (handleSplit) {
      handleSplit(splitsAmount)
    }
  }, [splitsAmount, handleSplit])

  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleProceedInternal}
      modalContent={
        <>
          <div>
            <h1>Mitmeks tükiks soovid faili jagada?</h1>
            <input
              value={splitsAmount}
              type="number"
              onChange={(e) => setSplitsAmount(Number(e.currentTarget.value))}
            />
          </div>
        </>
      }
    />
  )
}

export default CatSplitModal
