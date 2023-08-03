import { FC, useCallback, useState } from 'react'
import ModalBase, { ModalProps } from 'components/organisms/ModalBase/ModalBase'

export interface CatAnalyzisModalProps
  extends ModalProps {
}

const CatAnalyzisModal: FC<CatAnalyzisModalProps> = ({
  ...rest
}) => {
  return (
    <ModalBase
      {...rest}
    >
      <h1>Mahu analüüs valitud failidele</h1>
    </ModalBase>
  )
}

export default CatAnalyzisModal
