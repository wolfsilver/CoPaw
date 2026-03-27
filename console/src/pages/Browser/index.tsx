import { useState, useRef, useEffect } from "react";
import { Input, Button, Space, Card, message, Typography, Spin } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/PageHeader";
import { browserApi } from "../../api/modules/browser";
import styles from "./index.module.less";

const { Text } = Typography;

export default function BrowserPage() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("https://www.bing.com");
  const [currentUrl, setCurrentUrl] = useState("https://www.bing.com");
  const [pageTitle, setPageTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      message.warning(t("browser.emptyUrl"));
      return;
    }

    // Add protocol if missing
    let fullUrl = targetUrl.trim();
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "https://" + fullUrl;
    }

    setIsLoading(true);
    try {
      // Try to navigate
      const result = await browserApi.navigate(fullUrl);
      if (result.success) {
        setCurrentUrl(fullUrl);
        setPageTitle(result.title || fullUrl);
        message.success(t("browser.navigateSuccess"));
      } else {
        message.error(result.error || t("browser.navigateFailed"));
      }
    } catch (error) {
      message.error(t("browser.navigateFailed"));
      console.error("Navigation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = async () => {
    try {
      const result = await browserApi.goBack();
      if (result.success) {
        setCurrentUrl(result.url || currentUrl);
        setPageTitle(result.title || "");
        setCanGoBack(result.canGoBack || false);
        setCanGoForward(result.canGoForward || false);
      }
    } catch (error) {
      message.error(t("browser.actionFailed"));
    }
  };

  const handleGoForward = async () => {
    try {
      const result = await browserApi.goForward();
      if (result.success) {
        setCurrentUrl(result.url || currentUrl);
        setPageTitle(result.title || "");
        setCanGoBack(result.canGoBack || false);
        setCanGoForward(result.canGoForward || false);
      }
    } catch (error) {
      message.error(t("browser.actionFailed"));
    }
  };

  const handleRefresh = async () => {
    try {
      const result = await browserApi.refresh();
      if (result.success) {
        message.success(t("browser.refreshSuccess"));
      }
    } catch (error) {
      message.error(t("browser.actionFailed"));
    }
  };

  const handleHome = () => {
    setUrl("https://www.bing.com");
    handleNavigate("https://www.bing.com");
  };

  const handleOpenExternal = () => {
    if (currentUrl) {
      window.open(currentUrl, "_blank");
    }
  };

  // Check browser status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await browserApi.getStatus();
        if (status.url) {
          setCurrentUrl(status.url);
          setUrl(status.url);
        }
        if (status.title) {
          setPageTitle(status.title);
        }
        setCanGoBack(status.canGoBack || false);
        setCanGoForward(status.canGoForward || false);
      } catch (error) {
        console.error("Failed to get browser status:", error);
      }
    };
    checkStatus();
  }, []);

  return (
    <div className={styles.browserPage}>
      <PageHeader
        title={t("browser.title")}
        description={t("browser.description")}
      />

      <Card className={styles.browserCard}>
        {/* Navigation Controls */}
        <div className={styles.navigationBar}>
          <Space.Compact className={styles.navControls}>
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={handleGoBack}
              disabled={!canGoBack || isLoading}
              title={t("browser.back")}
            />
            <Button
              icon={<ArrowRight size={16} />}
              onClick={handleGoForward}
              disabled={!canGoForward || isLoading}
              title={t("browser.forward")}
            />
            <Button
              icon={<RotateCw size={16} />}
              onClick={handleRefresh}
              disabled={isLoading}
              title={t("browser.refresh")}
            />
            <Button
              icon={<Home size={16} />}
              onClick={handleHome}
              disabled={isLoading}
              title={t("browser.home")}
            />
          </Space.Compact>

          {/* Address Bar */}
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={() => handleNavigate(url)}
            placeholder={t("browser.urlPlaceholder")}
            className={styles.addressBar}
            disabled={isLoading}
            prefix={isLoading ? <Spin size="small" /> : null}
          />

          <Button
            type="primary"
            onClick={() => handleNavigate(url)}
            disabled={isLoading}
            className={styles.goButton}
          >
            {t("browser.go")}
          </Button>

          <Button
            icon={<ExternalLink size={16} />}
            onClick={handleOpenExternal}
            disabled={!currentUrl || isLoading}
            title={t("browser.openExternal")}
          />
        </div>

        {/* Page Title */}
        {pageTitle && (
          <div className={styles.pageTitle}>
            <Text type="secondary">{pageTitle}</Text>
          </div>
        )}

        {/* Browser Content */}
        <div className={styles.browserContent}>
          <div className={styles.pocNotice}>
            <Text type="warning">
              {t("browser.pocNotice")}
            </Text>
          </div>

          <div className={styles.browserInfo}>
            <Text strong>{t("browser.currentUrl")}: </Text>
            <Text copyable>{currentUrl}</Text>
          </div>

          <div className={styles.browserInfo}>
            <Text strong>{t("browser.status")}: </Text>
            <Text>{isLoading ? t("browser.loading") : t("browser.ready")}</Text>
          </div>

          <div className={styles.featureList}>
            <Text strong>{t("browser.features")}:</Text>
            <ul>
              <li>{t("browser.feature.navigate")}</li>
              <li>{t("browser.feature.backForward")}</li>
              <li>{t("browser.feature.refresh")}</li>
              <li>{t("browser.feature.addressBar")}</li>
              <li>{t("browser.feature.externalLink")}</li>
              <li>{t("browser.feature.titleSync")}</li>
            </ul>
          </div>

          <div className={styles.limitation}>
            <Text strong>{t("browser.limitations")}:</Text>
            <ul>
              <li>{t("browser.limitation.singleTab")}</li>
              <li>{t("browser.limitation.noBookmarks")}</li>
              <li>{t("browser.limitation.noHistory")}</li>
              <li>{t("browser.limitation.basicDownload")}</li>
              <li>{t("browser.limitation.basicUpload")}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
