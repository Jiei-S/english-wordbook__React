/**
 * menu
 */
import { NavLink } from 'react-router-dom';


const MENU_ITEMS = [
  {
    text: 'Dashboard',
    link: '/',
    iconClassNames: 'fas fa-home'
  },
  {
    text: 'Learning',
    link: '/learning',
    iconClassNames: 'fas fa-pencil-alt'
  },
  {
    text: 'English List',
    link: '/english-list',
    iconClassNames: 'fas fa-clipboard-list'
  },
  {
    text: 'Bookmark List',
    link: '/bookmark',
    iconClassNames: 'fas fa-bookmark'
  },
  {
    text: 'Activity',
    link: '/activity',
    iconClassNames: 'far fa-list-alt'
  },
  /**
  {
    text: 'Register',
    link: '/register',
    iconClassNames: 'fas fa-plus-circle'
  },
  */
];


/**
 * Menu
 * 
 * @return Component
 */
export const Menu = () => (
  <div className="menu-wrap">
    {
      MENU_ITEMS.map((menu, idx) => {
        return (
          <NavLink exact to={menu.link} key={idx}>
            <div className="menu">
              <i className={`mr-05 ${menu.iconClassNames}`}></i>
              <span>{menu.text}</span>
            </div>
          </NavLink>
        );
      })
    }
  </div>
);