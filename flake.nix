{
  description = "Nuns on the Run development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      systems = [ "aarch64-darwin" "aarch64-linux" "x86_64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          browsers = pkgs.playwright-driver.selectBrowsers {
            withChromium = true;
            withChromiumHeadlessShell = true;
            withFirefox = false;
            withWebkit = false;
          };
        in {
          default = assert pkgs.lib.assertMsg
            ((builtins.fromJSON (builtins.readFile ./package.json)).devDependencies."@playwright/test"
              == pkgs.playwright-driver.version)
            "Pin @playwright/test to the flake's playwright-driver version when updating the toolchain.";
            pkgs.mkShellNoCC {
              packages = with pkgs; [ nodejs_24 jdk21 git gh ripgrep browsers ];
              JAVA_HOME = "${pkgs.jdk21}";
              PLAYWRIGHT_BROWSERS_PATH = "${browsers}";
              PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
              PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
            };
        });
    };
}
