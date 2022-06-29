import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { FarmingMyFarms } from 'components/StakerMyStakes';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );
  const [isV3, setIsV3] = useState(false);
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const lpFarms = useDefaultFarmList();
  const dualFarms = useDefaultDualFarmList();

  const {
    fetchEternalFarms: {
      fetchEternalFarmsFn,
      eternalFarms,
      eternalFarmsLoading,
    },
  } = useFarmingSubgraph() || {};

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    return stakingPairLists.concat(dualPairLists);
  }, [chainIdOrDefault, lpFarms, dualFarms]);

  useEffect(() => {
    getBulkPairData(pairLists).then((data) => setBulkPairs(data));
  }, [pairLists]);

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX);
        setIsV3(false);
      },
      condition: !isV3 && farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
        setIsV3(false);
      },
      condition: !isV3 && farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
    {
      text: t('v3Mining'),
      onClick: () => setIsV3(true),
      condition: isV3,
    },
  ];

  const {
    fetchRewards: { rewardsResult, fetchRewardsFn, rewardsLoading },
    fetchAllEvents: { fetchAllEventsFn, allEvents, allEventsLoading },
    fetchTransferredPositions: {
      fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
    fetchHasTransferredPositions: {
      fetchHasTransferredPositionsFn,
      hasTransferredPositions,
      hasTransferredPositionsLoading,
    },
  } = useFarmingSubgraph() || {};
  const [now, setNow] = useState(Date.now());

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box mr={2}>
          <h4>{t('farm')}</h4>
        </Box>
        <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      <CustomSwitch
        width={300}
        height={48}
        items={farmCategories}
        isLarge={true}
      />
      {!isV3 && (
        <>
          <Box my={2}>
            <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
        </>
      )}
      {isV3 && (
        <>
          <FarmingMyFarms
            data={transferredPositions}
            refreshing={transferredPositionsLoading}
            fetchHandler={() => {
              fetchTransferredPositionsFn(true);
            }}
            now={now}
          />
          <EternalFarmsPage
            data={eternalFarms}
            refreshing={eternalFarmsLoading}
            fetchHandler={() => fetchEternalFarmsFn(true)}
          />
        </>
      )}
    </Box>
  );
};

export default FarmPage;
