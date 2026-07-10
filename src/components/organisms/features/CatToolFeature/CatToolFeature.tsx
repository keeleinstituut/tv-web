import TranslationMemoriesSection from "components/organisms/TranslationMemoriesSection/TranslationMemoriesSection"
import { FC } from "react"

interface CatToolFeatureProps {

}

const CatToolFeature: FC<CatToolFeatureProps> = () => {
    return (
        <TranslationMemoriesSection
        //   className={classes.translationMemories}
        //   hidden={!catSupported}
        //   control={control}
        //   isEditable={isSomethingEditable && isEmpty(catToolJobs) && !isShared}
        //   subProjectId={id}
        //   subProjectTmKeyObjectsArray={subProjectTmKeyObjectsArray}
        //   subProjectLangPair={subProjectLangPair}
        //   projectDomain={projectDomain}
            hidden={false}
            isEditable={true}
        />
    )
}

export default CatToolFeature