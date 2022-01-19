import {
  Box,
  Collapse,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem as MuiMenuItem,
  styled,
} from "@mui/material"
import { ChainId, IS_L2_SUPPORTED, IS_SDL_LIVE, SDL_TOKEN } from "../constants"
import {
  ExpandLess,
  ExpandMore,
  LightMode,
  NightlightRound,
} from "@mui/icons-material"
import React, { ReactElement, useState } from "react"
import CheckIcon from "@mui/icons-material/Check"

import { ReactComponent as SaddleLogo } from "../assets/icons/logo.svg"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useThemeSettings } from "../providers/ThemeSettingsProvider"
import { useTranslation } from "react-i18next"

const MenuItem = styled(MuiMenuItem)({
  display: "flex",
  justifyContent: "space-between",
})
interface SiteSettingsMenuProps {
  anchorEl?: Element
  close?: () => void
  direction?: "right" | "left"
}
export default function SiteSettingsMenu({
  anchorEl,
  close,
  direction = "right",
}: SiteSettingsMenuProps): ReactElement {
  const open = Boolean(anchorEl)
  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: direction,
        vertical: "bottom",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: direction,
      }}
      data-testid="settingsMenuContainer"
      onClose={close}
      PaperProps={{ sx: { minWidth: 240 } }}
    >
      <Box>
        {IS_L2_SUPPORTED && <NetworkSection key="network" />}
        <Divider variant="middle" />
        <LanguageSection key="language" />
        <Divider variant="middle" />
        <ThemeSection key="theme" />
        {IS_SDL_LIVE && <AddTokenSection key="token" />}
      </Box>
    </Menu>
  )
}

function AddTokenSection(): ReactElement | null {
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
    icon: `${window.location.origin}/logo.svg`,
  })
  const { t } = useTranslation()

  return canAdd ? (
    <MenuItem onClick={() => addToken()}>
      <span>{t("addSDL")}</span> <SaddleLogo height={24} width={24} />
    </MenuItem>
  ) : null
}

// refer to https://github.com/sushiswap/sushiswap-interface/blob/canary/src/modals/NetworkModal/index.tsx#L13
export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3"],
    blockExplorerUrls: ["https://etherscan.com"],
  },
  [ChainId.ARBITRUM]: {
    chainId: "0xA4B1",
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://mainnet-arb-explorer.netlify.app"],
  },
}
function NetworkSection(): ReactElement {
  const { t } = useTranslation()
  const { chainId: activeChainId, library, account } = useActiveWeb3React()
  const [isNetworkVisible, setIsNetworkVisible] = useState(false)
  const networks = [
    ChainId.MAINNET,
    ...(IS_L2_SUPPORTED ? [ChainId.ARBITRUM] : []),
  ]

  return (
    <div data-testid="networkMenuContainer">
      <MenuItem
        data-testid="networkMenuTitle"
        onClick={() => setIsNetworkVisible((state) => !state)}
      >
        {t("network")} {isNetworkVisible ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={isNetworkVisible}>
        <Box pl={5}>
          {networks.map((chainId) => {
            const params = SUPPORTED_NETWORKS[chainId]

            return (
              <MenuItem
                onClick={() => {
                  if (chainId === ChainId.MAINNET) {
                    void library?.send("wallet_switchEthereumChain", [
                      { chainId: "0x1" },
                      account,
                    ])
                  } else {
                    void library?.send("wallet_addEthereumChain", [
                      params,
                      account,
                    ])
                  }
                }}
                key={chainId}
              >
                <ListItemIcon>
                  {activeChainId === chainId && <CheckIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={params?.chainName} />
              </MenuItem>
            )
          })}
        </Box>
      </Collapse>
    </div>
  )
}

function LanguageSection(): ReactElement {
  const { t, i18n } = useTranslation()

  const [isLanguageVisible, setIsLanguageVisible] = useState(false)
  const languageOptions = [
    { displayText: "English", i18nKey: "en" },
    { displayText: "简体中文", i18nKey: "zh" },
  ]
  const currentLanguage = i18n.language
  return (
    <div>
      <MenuItem
        data-testid="languageMenu"
        onClick={() => setIsLanguageVisible((state) => !state)}
      >
        {t("language")}
        {isLanguageVisible ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      <Collapse in={isLanguageVisible}>
        <Box pl={5}>
          {languageOptions.map(({ displayText, i18nKey }) => (
            <MenuItem
              onClick={() => i18n.changeLanguage(i18nKey)}
              key={displayText}
            >
              <ListItemIcon>
                {currentLanguage === i18nKey && <CheckIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary={displayText} />
            </MenuItem>
          ))}
        </Box>
      </Collapse>
    </div>
  )
}

function ThemeSection(): ReactElement {
  const { t } = useTranslation()
  const { themeMode, onChangeMode } = useThemeSettings()

  const handleChangeMode = () => {
    onChangeMode(themeMode === "dark" ? "light" : "dark")
  }

  return (
    <MenuItem data-testid="themeMenuOption" onClick={handleChangeMode}>
      {t("theme")} {themeMode === "dark" ? <NightlightRound /> : <LightMode />}
    </MenuItem>
  )
}
