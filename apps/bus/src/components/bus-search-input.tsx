import { Input, type InputProps, NativeSelect } from '@chakra-ui/react';
import { Cities, type City, CityMap } from '@f2e/tdx-core';
import { type ChangeEventHandler, memo } from 'react';

interface BusSearchInputProps {
  city: City;
  display?: InputProps['display'];
  onSearch: ChangeEventHandler<HTMLInputElement>;
  onSelectCity: ChangeEventHandler<HTMLSelectElement>;
  searchString: string;
}

const BusSearchInput = ({
  display,
  searchString,
  onSearch,
  city: defaultCity,
  onSelectCity,
}: BusSearchInputProps) => (
  <>
    <NativeSelect.Root display={display} maxW="110px">
      <NativeSelect.Field
        onChange={onSelectCity}
        roundedRight="none"
        value={defaultCity}
      >
        {Cities.map((city) => (
          <option key={city} value={city}>
            {CityMap[city]}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
    <Input
      borderLeft="none"
      display={display}
      onChange={onSearch}
      placeholder="請輸入公車路線編號"
      roundedLeft="none"
      value={searchString}
    />
  </>
);

export default memo(BusSearchInput);
