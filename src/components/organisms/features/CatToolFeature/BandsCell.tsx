import Tag from "components/atoms/Tag/Tag"
import { useTranslation } from "react-i18next"
import { CattoAnalysisResults } from "./types"
import classes from "./classes.module.scss"

export const useBandLabels = (): Record<keyof CattoAnalysisResults["bands"], string> => {
  const { t } = useTranslation()
  return {
    ice: "101%",
    exact: "100%",
    repetitions: t('cat_tool_feature.analyses_table.band.repetitions'),
    high_fuzzy: "95-99%",
    medium_fuzzy: "85-94%",
    low_fuzzy: "75-84%",
    slight_fuzzy: "50-74%",
    no_match: t('cat_tool_feature.analyses_table.band.no_match'),
  }
}

interface BandsCellProps {
  bands: CattoAnalysisResults['bands']
}

const BandsCell = ({ bands }: BandsCellProps) => {
  const bandLabels = useBandLabels()
  return (
    <div className={classes.bandsCell}>
      {Object.entries(bands)
        .filter(([, stats]) => stats.words > 0)
        .map(([band, stats]) => (
          <Tag
            key={band}
            label={`${bandLabels[band as keyof typeof bandLabels]}: ${stats.words}`}
            value
          />
        ))}
    </div>
  )
}

export default BandsCell
