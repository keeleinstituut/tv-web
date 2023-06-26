import React, { FC, useState } from 'react'
import { Progress } from '@radix-ui/react-progress'
import { Root, Field, FormLabel } from '@radix-ui/react-form'
import classes from './styles.module.scss'

type Step = {
  label: string
  completed: boolean
}

const ProgressBarC: FC = () => {
  const [progress, setProgress] = useState(0)

  const steps: Step[] = [
    { label: 'Step 1', completed: false },
    { label: 'Step 2', completed: false },
    { label: 'Step 3', completed: false },
  ]
  return (
    <div>
      <Progress value={progress} max={steps.length - 1} />
      <Root>
        {steps.map((step, index) => (
          <Field key={index} name={''}>
            <FormLabel>{step.label}</FormLabel>
            <button
              disabled={step.completed}
              onClick={() => setProgress(index)}
            >
              Go to Step {index + 1}
            </button>
          </Field>
        ))}

        {/* <FormSubmitButton disabled={progress !== steps.length - 1}>
          Submit
        </FormSubmitButton> */}
      </Root>
    </div>
  )
}

export default ProgressBarC
