import socialCardStyle from './social-card.module.scss'

const getStateStatus = (state, combinedStates) => {
  let noDeaths
  let noCases

  const isCombinedState = combinedStates.indexOf(state.state) >= 0

  if (isCombinedState) {
    // if this state combines race and ethnicity data
    noDeaths = parseFloat(state.knownRaceEthDeath) === 0
    noCases = parseFloat(state.knownRaceEthPos) === 0
  } else {
    noDeaths = parseFloat(state.knownRaceDeath) === 0
    noCases = parseFloat(state.knownRacePos) === 0
  }

  const oneChart = (noCases || noDeaths) && !(noCases && noDeaths)

  const noCharts = noCases && noDeaths

  const casesOnly = oneChart && noDeaths

  const deathsOnly = oneChart && noCases

  return {
    oneChart,
    noCharts,
    casesOnly,
    deathsOnly,
  }
}

const getGroupValue = value => {
  if (value === null) {
    return null
  }
  return value * 100 // perCap is *per 1,000*, mulitply by 100 to get *per 100,000*
}

const getGroups = state => {
  if (state === undefined) {
    return {}
  }

  let groups = [
    {
      label: 'Black/African American',
      style: socialCardStyle.barBlack,
      cases: getGroupValue(state.blackPosPerCap),
      deaths: getGroupValue(state.blackDeathPerCap),
      smallNDeaths: state.blackSmallN,
    },
    {
      label: 'Hispanic/Latino',
      style: socialCardStyle.barLatinx,
      cases: getGroupValue(state.latinXPosPerCap),
      deaths: getGroupValue(state.latinXDeathPerCap),
      smallNDeaths: state.latinXSmallN,
    },
    {
      label: 'Asian',
      style: socialCardStyle.barAsian,
      cases: getGroupValue(state.asianPosPerCap),
      deaths: getGroupValue(state.asianDeathPerCap),
      smallNDeaths: state.asianSmallN,
    },
    {
      label: 'American Indian/ Alaska Native',
      style: socialCardStyle.barAian,
      cases: getGroupValue(state.aianPosPerCap),
      deaths: getGroupValue(state.aianDeathPerCap),
      smallNDeaths: state.aianSmallN,
    },
    {
      label: 'White',
      style: socialCardStyle.barWhite,
      cases: getGroupValue(state.whitePosPerCap),
      deaths: getGroupValue(state.whiteDeathPerCap),
      smallNDeaths: state.whiteSmallN,
    },
    {
      label: 'Asian/Pacific Islander',
      style: socialCardStyle.barAPi,
      cases: getGroupValue(state.apiPosPerCap),
      deaths: getGroupValue(state.apiDeathPerCap),
      smallNDeaths: state.apiSmallN,
    },
    {
      label: 'Native Hawaiian/ Pacific Islander',
      style: socialCardStyle.barNhpi,
      cases: getGroupValue(state.nhpiPosPerCap),
      deaths: getGroupValue(state.nhpiDeathPerCap),
      smallNDeaths: state.nhpiSmallN,
    },
  ]

  const aPi = groups.find(group => group.label === 'Asian/Pacific Islander')

  if (aPi.cases === null && aPi.deaths === null) {
    groups = groups.filter(
      // remove API bar
      group => group.label !== 'Asian/Pacific Islander',
    )
  } else {
    groups = groups.filter(
      // remove asian and NHPI bars
      group =>
        group.label !== 'Native Hawaiian/ Pacific Islander' &&
        group.label !== 'Asian',
    )
  }

  groups = groups.filter(
    // remove groups without case or death data
    group => !(group.cases === null && group.deaths === null),
  )

  const maxCasesPerCap = Math.max(...groups.map(group => group.cases))
  const maxDeathsPerCap = Math.max(...groups.map(group => group.deaths))

  groups.sort((a, b) => {
    // sort bars by # of deaths
    if (a.deaths >= b.deaths) {
      return -1
    }
    return 1
  })

  /*
    Copy to be used whenever {{GROUP}} is written
    e.g., "In Hawaii, as of September 16, Asians/Pacific Islanders
    have the highest COVID-19 infection rates..."
  */
  const copyLabels = {
    'Black/African American': 'Black/African American people',
    'Hispanic/Latino': 'Hispanic/Latino people',
    Asian: 'Asian people',
    White: 'White people',
    'Asian/Pacific Islander': 'Asians/Pacific Islanders',
    'Native Hawaiian/ Pacific Islander': 'Native Hawaiians/Pacific Islanders',
    'American Indian/ Alaska Native': 'American Indians/Alaska Natives',
  }

  const worstDeathsValue = Math.round(groups[0].deaths)
  const worstDeathsGroup = copyLabels[groups[0].label]

  groups.sort((a, b) => {
    // sort bars by # of cases
    if (a.cases >= b.cases) {
      return -1
    }
    return 1
  })

  const worstCasesValue = Math.round(groups[0].cases)
  const worstCasesGroup = copyLabels[groups[0].label]

  groups.forEach(group => {
    /* eslint-disable no-param-reassign */
    if (group.cases) {
      group.cases = Math.round(group.cases)
    }
    if (group.deaths) {
      group.deaths = Math.round(group.deaths)
    }
  })

  return {
    groups,
    maxCasesPerCap,
    maxDeathsPerCap,
    worstCasesGroup,
    worstCasesValue,
    worstDeathsGroup,
    worstDeathsValue,
  }
}

const getTypeOfRates = (state, combinedStates) => {
  const stateStatus = getStateStatus(state, combinedStates)

  if (stateStatus.noCharts) {
    return 'no rates'
  }

  if (stateStatus.deathsOnly) {
    return 'mortality rates'
  }

  if (stateStatus.casesOnly) {
    return 'infection rates'
  }

  return 'infection and mortality rates'
}

const getBarWidth = (number, max, square, oneChart) => {
  let maxPixels
  if (square) {
    if (oneChart) {
      maxPixels = 518
    }
    if (!oneChart) {
      maxPixels = 238
    }
  }
  if (!square) {
    if (oneChart) {
      maxPixels = 525
    }
    if (!oneChart) {
      maxPixels = 240
    }
  }
  return (number / max) * maxPixels
}

export { getStateStatus, getGroups, getTypeOfRates, getBarWidth }
