/**
 * header
 */
import { Link } from 'react-router-dom';

import { Menu } from './menu';


/**
 * Header
 * 
 * @return Component
 */
export const Header = () => (
  <header>
    <Link to="/" style={{ color: 'white' }}>My English Wordbook</Link>
    <Menu />
  </header>
);