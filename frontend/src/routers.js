/**
 * routers
 */
import { Switch, Route } from 'react-router-dom';

import { Dashboard } from './components/dashboard';
import { Learning } from './components/learning';
import { EnglishList } from './components/english-list';
import { Bookmark } from './components/bookmark';
import { Activity } from './components/activity';


/**
 * Routers
 * 
 * @return Component
 */
export const Routers = () => (
  <div className="container">
    <Switch>
      <Route exact path="/">
        <Dashboard />
      </Route>
      <Route exact path="/learning">
        <Learning />
      </Route>
      <Route exact path="/english-list">
        <EnglishList />
      </Route>
      <Route exact path="/bookmark">
        <Bookmark />
      </Route>
      <Route exact path="/activity">
        <Activity />
      </Route>
    </Switch>
  </div>
);