import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Register from './pages/Register';
import History from './pages/History';
import ItemDetail from './pages/ItemDetail';
import Compare from './pages/Compare';
import ShoppingListDetail from './pages/ShoppingListDetail';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Statistics from './pages/Statistics';
import { listOutline, timeOutline, calculatorOutline, settingsOutline, pieChartOutline } from 'ionicons/icons';
import { StatusBar, Style } from '@capacitor/status-bar';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();



const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Native Status Bar & App State
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (e) {
        console.log('Status bar not available');
      }
    };
    initNative();

    // Check App Initialization
    const checkInit = () => {
      const init = localStorage.getItem('app_initialized');
      setIsInitialized(init === 'true');
    };
    checkInit();
  }, []);



  // New User / Not Initialized Flow
  if (!isInitialized) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/welcome">
              <Welcome />
            </Route>
            <Route exact path="/onboarding">
              <Onboarding />
            </Route>
            <Route>
              <Redirect to="/welcome" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }



  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/history">
              <History />
            </Route>
            <Route exact path="/history/item/:itemName">
              <ItemDetail />
            </Route>
            <Route exact path="/statistics">
              <Statistics />
            </Route>
            <Route exact path="/register">
              <Register />
            </Route>
            <Route exact path="/list/:id">
              <ShoppingListDetail />
            </Route>
            <Route exact path="/compare">
              <Compare />
            </Route>
            <Route exact path="/settings">
              <Settings />
            </Route>
            <Route exact path="/privacy">
              <PrivacyPolicy />
            </Route>
            <Route exact path="/terms">
              <TermsConditions />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route exact path="/login">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom" className="border-t border-gray-100 shadow-sm pb-2 pt-2 h-16">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={listOutline} />
              <IonLabel>My Lists</IonLabel>
            </IonTabButton>
            <IonTabButton tab="compare" href="/compare">
              <IonIcon icon={calculatorOutline} />
              <IonLabel>Compare</IonLabel>
            </IonTabButton>
            <IonTabButton tab="history" href="/history">
              <IonIcon icon={timeOutline} />
              <IonLabel>History</IonLabel>
            </IonTabButton>
            <IonTabButton tab="statistics" href="/statistics">
              <IonIcon icon={pieChartOutline} />
              <IonLabel>Stat</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={settingsOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
