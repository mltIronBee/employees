import React from 'react';
import { Dropdown } from 'semantic-ui-react';

export const SearchDropdown = (props) => (

    <Dropdown fluid
              multiple
              search
              selection
              options={ props.dropdownOptions }
              placeholder="Searched skills"
              onChange={ props.onDropdownChange } />
);